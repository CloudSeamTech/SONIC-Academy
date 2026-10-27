"""Offline OpenSSL exercise rehearsal, not a RHEL/NGINX infrastructure capture."""
import os, subprocess, tempfile, pathlib, shutil
ROOT=pathlib.Path(__file__).resolve().parents[1]
def run(*args,cwd=None,input=None,ok=True):
 p=subprocess.run(list(args),cwd=cwd,input=input,text=True,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
 if ok and p.returncode: raise AssertionError(f'Command failed: {args[0:3]}\n{p.stderr}')
 return p
with tempfile.TemporaryDirectory(prefix='sonic-tls-test-') as tmp:
 home=pathlib.Path(tmp);ca=home/'tls-ca';ca.mkdir(mode=0o700)
 for d in ['incoming','issued','public']:(ca/d).mkdir()
 password=home/'test-passphrase';password.write_text('throwaway-ephemeral-test-only\n');password.chmod(0o600)
 passarg='file:'+str(password)
 for name in ['root','intermediate']:
  run('openssl','genpkey','-algorithm','RSA','-aes-256-cbc','-pkeyopt','rsa_keygen_bits:3072','-pass',passarg,'-out',str(ca/(name+'.key')))
 run('openssl','req','-new','-x509','-sha256','-days','3650','-key','root.key','-passin',passarg,'-out','root.crt','-subj','/CN=SONIC Practice Root CA','-addext','basicConstraints=critical,CA:TRUE,pathlen:1','-addext','keyUsage=critical,keyCertSign,cRLSign',cwd=ca)
 run('openssl','req','-new','-sha256','-key','intermediate.key','-passin',passarg,'-out','intermediate.csr','-subj','/CN=SONIC Practice Issuing CA',cwd=ca)
 shutil.copyfile(ROOT/'public/tls-lab/intermediate.ext',ca/'intermediate.ext');shutil.copyfile(ROOT/'public/tls-lab/server.ext',ca/'server.ext')
 run('openssl','x509','-req','-in','intermediate.csr','-CA','root.crt','-CAkey','root.key','-passin',passarg,'-CAserial','root.srl','-CAcreateserial','-days','1825','-sha256','-extfile','intermediate.ext','-out','intermediate.crt',cwd=ca)
 run('openssl','verify','-CAfile','root.crt','intermediate.crt',cwd=ca)
 # Exercise -key and -newkey separately; all private material is temporary and deleted.
 key=home/'app-v1.key';run('openssl','genpkey','-algorithm','RSA','-pkeyopt','rsa_keygen_bits:3072','-out',str(key));key.chmod(0o600)
 run('openssl','req','-new','-sha256','-key',str(key),'-out',str(ca/'incoming/app-v1.csr'),'-config',str(ROOT/'public/tls-lab/req.cnf'))
 run('openssl','req','-new','-newkey','rsa:3072','-noenc','-sha256','-keyout',str(home/'app-v3.key'),'-out',str(ca/'incoming/app-v3.csr'),'-config',str(ROOT/'public/tls-lab/req.cnf'))
 serials=[]
 for version in ['v1','r1','v3']:
  if version=='r1':run('openssl','req','-new','-sha256','-key',str(key),'-out',str(ca/'incoming/app-r1.csr'),'-config',str(ROOT/'public/tls-lab/req.cnf'))
  run('openssl','req','-in',f'incoming/app-{version}.csr','-noout','-verify',cwd=ca)
  run('openssl','x509','-req','-in',f'incoming/app-{version}.csr','-CA','intermediate.crt','-CAkey','intermediate.key','-passin',passarg,'-CAserial','intermediate.srl','-CAcreateserial','-days','90','-sha256','-extfile','server.ext','-out',f'issued/app-{version}.crt',cwd=ca)
  run('openssl','verify','-CAfile','root.crt','-untrusted','intermediate.crt','-purpose','sslserver','-verify_hostname','app.example.mil',f'issued/app-{version}.crt',cwd=ca)
  serials.append(run('openssl','x509','-in',f'issued/app-{version}.crt','-noout','-serial',cwd=ca).stdout)
 assert len(set(serials))==3
 def pub_key(path):return run('openssl','pkey','-in',str(path),'-pubout').stdout
 def cert_key(path):return run('openssl','x509','-in',str(path),'-pubkey','-noout').stdout
 assert run('openssl','req','-in',str(ca/'incoming/app-v1.csr'),'-pubkey','-noout').stdout==pub_key(key)
 assert cert_key(ca/'issued/app-v1.crt')==pub_key(key)==cert_key(ca/'issued/app-r1.crt')
 assert cert_key(ca/'issued/app-v3.crt')==pub_key(home/'app-v3.key')
 assert cert_key(ca/'issued/app-v3.crt')!=pub_key(key)
 assert run('openssl','verify','-CAfile','root.crt','-untrusted','intermediate.crt','-verify_hostname','wrong.example.mil','issued/app-v1.crt',cwd=ca,ok=False).returncode!=0
 assert run('openssl','verify','-CAfile','root.crt','issued/app-v1.crt',cwd=ca,ok=False).returncode!=0
 assert run('openssl','x509','-in',str(ca/'issued/app-v1.crt'),'-noout','-checkend','2592000').returncode==0
 # The published fixture uses an encrypted signing key and prompts through stdin in this no-TTY rehearsal.
 helper=ROOT/'public/tls-lab/make-expired-fixture.sh';run('bash','-n',str(helper))
 env={**os.environ,'SONIC_TLS_CA_DIR':str(ca)}
 expired=subprocess.run(['bash',str(helper)],env=env,input='throwaway-ephemeral-test-only\n',text=True,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
 assert expired.returncode==0,expired.stderr
 bad=run('openssl','verify','-CAfile','root.crt','-untrusted','intermediate.crt','-verify_hostname','app.example.mil','issued/app-expired.crt',cwd=ca,ok=False)
 assert bad.returncode!=0 and 'expired' in bad.stderr.lower(),bad.stderr
 assert cert_key(ca/'issued/app-expired.crt')==pub_key(key)
 rerun=subprocess.run(['bash',str(helper)],env=env,text=True,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
 assert rerun.returncode!=0 and 'already exists' in rerun.stderr
 run('bash','-n',str(ROOT/'public/tls-lab/check-app-tls.sh'))
 if '--endpoint' in __import__('sys').argv:
  import http.server, ssl, threading
  class Page(http.server.BaseHTTPRequestHandler):
   def do_GET(self):
    body=b'TLS practice application'; self.send_response(200); self.send_header('Content-Length',str(len(body))); self.end_headers(); self.wfile.write(body)
   def log_message(self,*args): pass
  bundle=home/'fullchain.pem';bundle.write_text((ca/'issued/app-v3.crt').read_text()+(ca/'intermediate.crt').read_text())
  server=http.server.ThreadingHTTPServer(('127.0.0.1',0),Page)
  context=ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER);context.load_cert_chain(str(bundle),str(home/'app-v3.key'))
  server.socket=context.wrap_socket(server.socket,server_side=True)
  thread=threading.Thread(target=server.serve_forever,daemon=True);thread.start()
  try:
   port=server.server_address[1]
   script=(ROOT/'public/tls-lab/check-app-tls.sh').read_text().replace('10.90.0.10:443',f'127.0.0.1:{port}').replace('/etc/pki/tls/certs/sonic-lab-root.crt',str(ca/'root.crt')).replace('app.example.mil:443:10.90.0.10',f'app.example.mil:{port}:127.0.0.1').replace('https://app.example.mil/',f'https://app.example.mil:{port}/').replace('curl --cacert','curl --noproxy app.example.mil --cacert')
   monitor=home/'monitor.sh';monitor.write_text(script)
   checked=run('bash',str(monitor))
   assert 'will not expire' in checked.stdout
   print('PASS: loopback HTTPS endpoint, full served chain, SNI/hostname/root verification and published monitor/filter logic. This is not a RHEL/NGINX deployment.')
  finally: server.shutdown();server.server_close();thread.join(timeout=3)
 print('PASS: encrypted root/intermediate; SAN/serverAuth chain; existing/new keys; renewal serials; pair match/mismatch; wrong name/missing intermediate; genuine expired fixture; repeat guard; shell syntax. All ephemeral keys deleted.')
