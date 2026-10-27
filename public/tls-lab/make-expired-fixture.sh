#!/bin/bash
# ISOLATED PRACTICE CA ONLY. Create an expired public leaf, never a private key.
set -euo pipefail
# Optional dedicated directory override for the offline verification harness.
cd "${SONIC_TLS_CA_DIR:-$HOME/tls-ca}"
for file in intermediate.crt intermediate.key server.ext incoming/app-v1.csr; do
  test -s "$file" || { printf 'Missing CA input: %s\n' "$file" >&2; exit 1; }
done
if test -e issued/app-expired.crt || test -e expired-index.txt; then
  echo 'Expired fixture already exists. Inspect it; do not overwrite CA state.' >&2
  exit 1
fi
umask 077
mkdir -p expired-newcerts public issued
: > expired-index.txt
printf 'F000\n' > expired-serial
cat > expired.cnf <<'EOF'
[ca]
default_ca = lab
[lab]
database = expired-index.txt
new_certs_dir = expired-newcerts
serial = expired-serial
certificate = intermediate.crt
private_key = intermediate.key
default_md = sha256
default_days = 1
policy = names
unique_subject = no
copy_extensions = none
[names]
commonName = supplied
EOF
start=$(date -u -d '2 days ago' +%Y%m%d%H%M%SZ)
end=$(date -u -d '1 day ago' +%Y%m%d%H%M%SZ)
openssl ca -batch -notext -config expired.cnf -extfile server.ext \
  -startdate "$start" -enddate "$end" -in incoming/app-v1.csr -out issued/app-expired.crt
openssl x509 -in issued/app-expired.crt -noout -dates -serial
cp issued/app-expired.crt public/
chmod 644 public/app-expired.crt
echo 'EXPIRED FIXTURE ONLY: do not install outside the isolated final lab.'
