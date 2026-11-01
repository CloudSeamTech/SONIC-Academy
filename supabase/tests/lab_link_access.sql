-- Read-only release smoke test after migration. Expect all three tables true,
-- browser RPC false, service RPC true and browser schema access false.
select n.nspname, c.relname, c.relrowsecurity
from pg_catalog.pg_class c join pg_catalog.pg_namespace n on n.oid=c.relnamespace
where n.nspname='lab_link' and c.relname in ('pairings','runs','audit');
select
  pg_catalog.has_function_privilege('anon','public.lab_link_rpc(text,jsonb)','execute') as anon_rpc,
  pg_catalog.has_function_privilege('authenticated','public.lab_link_rpc(text,jsonb)','execute') as student_rpc,
  pg_catalog.has_function_privilege('service_role','public.lab_link_rpc(text,jsonb)','execute') as server_rpc,
  pg_catalog.has_schema_privilege('authenticated','lab_link','usage') as student_private_schema;
