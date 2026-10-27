#!/bin/bash
set -euo pipefail
sample=$(mktemp)
trap 'rm -f "$sample"' EXIT
timeout 10 openssl s_client -connect 10.90.0.10:443 -servername app.example.mil \
  -CAfile /etc/pki/tls/certs/sonic-lab-root.crt -verify_return_error \
  -verify_hostname app.example.mil -showcerts < /dev/null | \
  awk '/-----BEGIN CERTIFICATE-----/{in_cert=1} in_cert{print} /-----END CERTIFICATE-----/{in_cert=0}' > "$sample"
openssl x509 -in "$sample" -noout -checkend 2592000
curl --cacert /etc/pki/tls/certs/sonic-lab-root.crt \
  --resolve app.example.mil:443:10.90.0.10 --fail --silent --show-error \
  --max-time 10 https://app.example.mil/ > /dev/null
