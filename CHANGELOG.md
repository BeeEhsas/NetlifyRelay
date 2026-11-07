# Changelog

## 1.0.0 — 2026-11-06

- Netlify Edge Function relay for Xray VLESS + XHTTP.
- Header-based padding (`xPaddingObfsMode`) to avoid Netlify's `429` on `x_padding` in `Referer`.
- `packet-up` client mode (Netlify buffers streaming uploads).
- Custom-domain and clean-IP instructions.
- Examples for 3x-ui, plain Xray server, Xray client, and a share-link generator.
