#!/usr/bin/env sh
# Build a VLESS + XHTTP share link for this relay.
# Usage: ./make-link.sh <uuid> <domain> <path> [address] [name]
#   address  optional clean Netlify IP (defaults to the domain)
set -eu
UUID="${1:?uuid}"; DOMAIN="${2:?domain}"; XPATH="${3:?path}"
ADDR="${4:-$DOMAIN}"; NAME="${5:-netlify-xhttp}"
EXTRA='%7B%22xPaddingBytes%22%3A%221-1%22%2C%22xPaddingObfsMode%22%3Atrue%2C%22xPaddingKey%22%3A%22t%22%2C%22xPaddingHeader%22%3A%22X-Trace%22%2C%22xPaddingPlacement%22%3A%22header%22%7D'
ENC_PATH=$(printf '%s' "$XPATH" | sed 's#/#%2F#g')
printf 'vless://%s@%s:443?encryption=none&security=tls&sni=%s&fp=chrome&alpn=h2&type=xhttp&host=%s&path=%s&mode=packet-up&extra=%s#%s\n' \
  "$UUID" "$ADDR" "$DOMAIN" "$DOMAIN" "$ENC_PATH" "$EXTRA" "$NAME"
