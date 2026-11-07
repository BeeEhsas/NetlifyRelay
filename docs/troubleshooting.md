# Troubleshooting

Replace `relay.example.com` and `/your-secret-path` with your own values.

## 1. Is the site up?

```sh
curl -I https://relay.example.com/
```

- `HTTP/2 200` — the decoy site is served.
- A block page / `403` with an iframe to a private IP — the hostname is filtered on your network. Use another subdomain or a clean IP.
- `401` "Login redirect" — the site is password-protected or not claimed yet in Netlify.

## 2. Does the relay reach Xray?

```sh
curl -s -o /dev/null -w '%{http_code}\n' https://relay.example.com/your-secret-path/x
```

| Code | Meaning |
|---|---|
| `400` | Good. Xray answered (the request just isn't a valid XHTTP session). |
| `404` | `XHTTP_PATH` not set, or you didn't redeploy after setting env vars. |
| `502` | Netlify can't reach `BACKEND_URL` — port closed, wrong IP, or Xray not listening. |

## 3. Is the WAF blocking you?

```sh
curl -s -o /dev/null -w '%{http_code}\n' \
  -H 'Referer: https://relay.example.com/your-secret-path/?x_padding=X' \
  https://relay.example.com/your-secret-path/x
```

If this returns `429`, Netlify is blocking the default XHTTP padding signature. Make sure **both** server and client use:

```json
"xPaddingObfsMode": true,
"xPaddingKey": "t",
"xPaddingHeader": "X-Trace",
"xPaddingPlacement": "header"
```

and that the client core is recent enough (Xray 26.x) to honor them.

## 4. Connected but no traffic

The client is using `stream-up` or `stream-one`. Netlify buffers streaming uploads, so use `packet-up`.

## 5. Clean IP test

```sh
curl -sI --resolve relay.example.com:443:<IP> https://relay.example.com/
```

`HTTP/2 200` means the IP is usable. Put the IP as the address; keep SNI and Host on your domain.

## 6. Test with a desktop Xray client

```sh
xray run -c examples/client/client.json
curl -x socks5h://127.0.0.1:10808 https://ifconfig.me    # should print your server's IP
```
