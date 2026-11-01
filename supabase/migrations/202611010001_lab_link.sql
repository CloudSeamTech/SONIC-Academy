-- Run in a NEW Supabase project's SQL editor before enabling Lab Link.
-- Only the server's service_role can call the RPC. No browser gets table access.
begin;
create schema if not exists lab_link;
revoke all on schema lab_link from public, anon, authenticated;

create table lab_link.pairings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  lesson_id text not null check (lesson_id = 'lab-04'),
  expected jsonb not null,
  created_at timestamptz not null default now(),
  enrollment_expires timestamptz not null default now() + interval '10 minutes',
  device_expires timestamptz,
  code_hash text unique,
  device_hash text unique,
  confirmation_hash text,
  confirmation_attempts integer not null default 0,
  hostname text,
  state text not null default 'waiting-for-checker'
    check (state in ('waiting-for-checker','awaiting-approval','paired','revoked')),
  last_seen timestamptz
);
create index on lab_link.pairings(owner_id, created_at);
create table lab_link.runs (
  id uuid primary key default gen_random_uuid(),
  pairing_id uuid not null references lab_link.pairings(id) on delete cascade,
  expected jsonb not null,
  state text not null default 'queued' check (state in ('queued','leased','complete','cancelled')),
  created_at timestamptz not null default now(),
  lease_hash text,
  lease_expires timestamptz,
  result jsonb,
  completed_at timestamptz
);
create unique index one_active_run on lab_link.runs(pairing_id) where state in ('queued','leased');
create table lab_link.audit (
  id bigint generated always as identity primary key,
  pairing_id uuid not null references lab_link.pairings(id) on delete cascade,
  event text not null,
  recorded_at timestamptz not null default now()
);
alter table lab_link.pairings enable row level security;
alter table lab_link.runs enable row level security;
alter table lab_link.audit enable row level security;
revoke all on all tables in schema lab_link from public, anon, authenticated;

-- One transaction per operation. Pairing row locks serialize claims, runs,
-- leases, submissions and revocation across serverless instances.
create or replace function public.lab_link_rpc(op text, arg jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  p lab_link.pairings;
  r lab_link.runs;
  owner uuid;
begin
  if op = 'list' then
    return (select jsonb_build_object('pairings',coalesce(jsonb_agg(x.item),'[]'::jsonb)) from (
      select jsonb_build_object('pairingId',id,'hostname',hostname,'lessonId',lesson_id,
        'expected',expected,'state',case when state<>'revoked' and coalesce(device_expires,enrollment_expires)<=now()
        then 'expired' else state end) as item from lab_link.pairings
      where owner_id=(arg->>'owner')::uuid order by created_at desc limit 20
    ) x);
  end if;
  if op = 'create' then
    owner := (arg->>'owner')::uuid;
    -- Serialize owner quota checks without process-local state.
    perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(owner::text, 0));
    if (select count(*) from lab_link.pairings where owner_id = owner
        and created_at > now() - interval '1 hour') >= 5 then
      return jsonb_build_object('error','Too many pairing requests. Try later.','status',429);
    end if;
    if arg->>'lessonId' <> 'lab-04' then
      return jsonb_build_object('error','No reviewed check pack for this lesson.','status',422);
    end if;
    insert into lab_link.pairings(owner_id,lesson_id,expected,code_hash)
      values(owner,arg->>'lessonId',arg->'expected',arg->>'codeHash') returning * into p;
    insert into lab_link.audit(pairing_id,event) values(p.id,'pairing-created');
    return jsonb_build_object('pairingId',p.id,'expiresAt',p.enrollment_expires);
  end if;

  if op = 'enroll' then
    select * into p from lab_link.pairings where code_hash = arg->>'codeHash' for update;
    if not found or p.state <> 'waiting-for-checker' or p.enrollment_expires <= now() then
      return jsonb_build_object('error','Enrollment code unavailable or expired.','status',401);
    end if;
    update lab_link.pairings set code_hash=null, device_hash=arg->>'deviceHash',
      confirmation_hash=arg->>'confirmationHash', hostname=arg->>'hostname',
      state='awaiting-approval',device_expires=now()+interval '1 hour' where id=p.id;
    insert into lab_link.audit(pairing_id,event) values(p.id,'checker-enrolled');
    return jsonb_build_object('pairingId',p.id,'state','awaiting-approval');
  end if;

  if op in ('poll','prepare-submit','submit') then
    select * into p from lab_link.pairings where device_hash=arg->>'deviceHash' for update;
    if not found or p.state='revoked' or p.device_expires <= now() then
      return jsonb_build_object('error','Device session expired or revoked. Pair again.','status',401);
    end if;
    if p.state <> 'paired' then
      if op='poll' then return jsonb_build_object('state','awaiting-approval','job',null); end if;
      return jsonb_build_object('error','Approve this machine first.','status',403);
    end if;
    update lab_link.pairings set last_seen=now() where id=p.id;
    if op='poll' then
      select * into r from lab_link.runs where pairing_id=p.id and
        (state='queued' or (state='leased' and lease_expires <= now())) order by created_at limit 1 for update;
      if not found then return jsonb_build_object('state','paired','job',null); end if;
      update lab_link.runs set state='leased',lease_hash=arg->>'leaseHash',
        lease_expires=now()+interval '2 minutes' where id=r.id;
      return jsonb_build_object('state','paired','job',jsonb_build_object(
        'runId',r.id,'checkSet','windows-dc01','version','1.0.0','expiresAt',now()+interval '2 minutes'));
    end if;
    select * into r from lab_link.runs where id=(arg->>'runId')::uuid and pairing_id=p.id for update;
    if not found or r.state <> 'leased' or r.lease_hash is distinct from arg->>'leaseHash'
       or r.lease_expires <= now() then
      return jsonb_build_object('error','Run lease expired or already consumed. Rerun the checks.','status',409);
    end if;
    if op='prepare-submit' then return jsonb_build_object('expected',r.expected); end if;
    update lab_link.runs set state='complete',result=arg->'result',completed_at=now(),lease_hash=null where id=r.id;
    insert into lab_link.audit(pairing_id,event) values(p.id,'check-completed');
    return jsonb_build_object('runId',r.id,'state','complete');
  end if;

  select * into p from lab_link.pairings where id=(arg->>'pairingId')::uuid
    and owner_id=(arg->>'owner')::uuid for update;
  if not found then return jsonb_build_object('error','Pairing not found.','status',404); end if;
  if op='status' then
    return jsonb_build_object('pairingId',p.id,'hostname',p.hostname,'state',
      case when p.state <> 'revoked' and coalesce(p.device_expires,p.enrollment_expires)<=now() then 'expired' else p.state end,
      'connected',p.state='paired' and p.device_expires>now() and coalesce(p.last_seen>now()-interval '45 seconds',false),
      'lastSeen',p.last_seen);
  elsif op='approve' then
    if p.state <> 'awaiting-approval' or p.enrollment_expires<=now() then
      return jsonb_build_object('error','Pairing expired or unavailable.','status',409);
    end if;
    if p.confirmation_hash is distinct from arg->>'confirmationHash' then
      update lab_link.pairings set confirmation_attempts=confirmation_attempts+1,
        state=case when confirmation_attempts>=4 then 'revoked' else state end,
        device_hash=case when confirmation_attempts>=4 then null else device_hash end where id=p.id;
      insert into lab_link.audit(pairing_id,event) values(p.id,'confirmation-rejected');
      return jsonb_build_object('error','Confirmation does not match.','status',403);
    end if;
    update lab_link.pairings set state='paired',confirmation_hash=null where id=p.id;
    insert into lab_link.audit(pairing_id,event) values(p.id,'pairing-approved');
    return jsonb_build_object('state','paired','connected',false);
  elsif op='revoke' then
    update lab_link.pairings set state='revoked',device_hash=null,code_hash=null,confirmation_hash=null where id=p.id;
    update lab_link.runs set state='cancelled',lease_hash=null where pairing_id=p.id and state in ('queued','leased');
    insert into lab_link.audit(pairing_id,event) values(p.id,'pairing-revoked');
    return jsonb_build_object('state','revoked');
  elsif op='request' then
    if p.state <> 'paired' or p.device_expires<=now() then
      return jsonb_build_object('error','Pair this machine first.','status',409);
    end if;
    if exists(select 1 from lab_link.runs where pairing_id=p.id and state in ('queued','leased')) then
      return jsonb_build_object('error','A run is already waiting.','status',409);
    end if;
    if (select count(*) from lab_link.runs where pairing_id=p.id and created_at>now()-interval '1 hour')>=30 then
      return jsonb_build_object('error','Run limit reached. Try later.','status',429);
    end if;
    insert into lab_link.runs(pairing_id,expected) values(p.id,p.expected) returning * into r;
    insert into lab_link.audit(pairing_id,event) values(p.id,'check-queued');
    return jsonb_build_object('runId',r.id,'state','queued');
  elsif op='results' then
    select * into r from lab_link.runs where id=(arg->>'runId')::uuid and pairing_id=p.id;
    if not found then return jsonb_build_object('error','Run not found.','status',404); end if;
    return jsonb_build_object('runId',r.id,'state',r.state,'result',r.result,'completedAt',r.completed_at);
  end if;
  return jsonb_build_object('error','Unknown operation.','status',400);
end;
$$;
revoke all on function public.lab_link_rpc(text,jsonb) from public, anon, authenticated;
grant execute on function public.lab_link_rpc(text,jsonb) to service_role;
commit;
