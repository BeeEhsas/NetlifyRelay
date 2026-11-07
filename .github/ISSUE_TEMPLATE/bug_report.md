---
name: Bug report
about: Something doesn't connect
labels: bug
---

**What happens**
<!-- e.g. EOF in v2rayNG, 429, 502 -->

**Checks** (see docs/troubleshooting.md)
- [ ] `curl -I https://<domain>/` →
- [ ] `curl https://<domain>/<path>/x` status →
- [ ] Client mode is `packet-up`
- [ ] Padding-obfs fields set on both server and client

**Versions**
- Xray server:
- Client app + core:
- Panel (if any):

Please remove UUIDs, IPs and domains before posting.
