<div align="center" dir="rtl">

# NetlifyRelay

**رلهٔ Xray (VLESS + XHTTP) از طریق Edge Function نتلیفای — همراه با سه اصلاحی که باعث می‌شه واقعاً کار کنه.**

[![License: MIT](https://img.shields.io/badge/License-MIT-0b5cad.svg)](LICENSE)

[English](README.md) · [فارسی](README.fa.md)

</div>

<div dir="rtl">

## چطور کار می‌کنه

```
کلاینت (v2rayNG)  ──TLS/h2──▶  Netlify Edge (relay.js)  ──HTTP──▶  اینباند XHTTP روی سرور شما
                                 بقیهٔ مسیرها → صفحهٔ ساختگی /public
```

- فقط درخواست‌های زیر `XHTTP_PATH` رله می‌شن؛ بقیه یه صفحهٔ سادهٔ استاتیک می‌بینن.
- بدون build و بدون وابستگی؛ با دامنهٔ اختصاصی و آی‌پی تمیز نتلیفای کار می‌کنه.

## چرا بیشتر راه‌اندازی‌ها شکست می‌خورن

با Xray-core 26.6.1 در نوامبر 2026 تست شده:

| مشکل | علامت | راه‌حل |
|---|---|---|
| WAF نتلیفای درخواستی که `Referer` آن `x_padding=` داره رو می‌بنده (جای پیش‌فرض پدینگ Xray) | `429` و `EOF` در کلاینت | پدینگ در هدر اختصاصی: `xPaddingObfsMode` + `xPaddingPlacement: header` |
| نتلیفای بدنهٔ درخواست استریمی رو بافر می‌کنه | `stream-up` وصل می‌شه ولی دیتا نمی‌ره | کلاینت روی **`packet-up`**، سرور روی `auto` |
| دامنهٔ `*.netlify.app` در بعضی شبکه‌ها فیلتره | EOF یا صفحهٔ فیلتر | دامنه یا ساب‌دامین خودتون |

## راه‌اندازی سریع

### ۱. اینباند سرور

</div>

```json
"xhttpSettings": {
  "path": "/your-secret-path",
  "host": "",
  "mode": "auto",
  "xPaddingBytes": "1-1",
  "xPaddingObfsMode": true,
  "xPaddingKey": "t",
  "xPaddingHeader": "X-Trace",
  "xPaddingPlacement": "header"
}
```

<div dir="rtl">

- در 3x-ui: Inbounds → Import → فایل `examples/3x-ui/inbound-import.json`
- Xray خام: `examples/xray/server.json`
- `host` رو خالی بذارید؛ رله هدر Host رو حذف می‌کنه.
- پورت اینباند (مثلاً `8880`) رو در فایروال باز کنید.

### ۲. دیپلوی روی Netlify

ریپو رو Fork کنید و در Netlify با **Import from Git** وصلش کنید (یا زیپ کنید و **Deploy manually**). Build command خالی، Publish directory: `public`.

متغیرهای محیطی:

| متغیر | مثال |
|---|---|
| `BACKEND_URL` | `http://203.0.113.10:8880` |
| `XHTTP_PATH` | `/your-secret-path` |

بعد یه دیپلوی جدید بزنید.

### ۳. دامنهٔ اختصاصی

۱. Domain management → Add domain → `relay.example.com`
۲. رکورد `CNAME relay → <site>.netlify.app` (در Cloudflare حالت DNS only)
۳. صبر تا گواهی Let's Encrypt صادر بشه.

تست: آدرس `/<path>/x` باید `400` بده؛ یعنی رله به Xray رسیده.

### ۴. کلاینت

لینک نمونه در `examples/client/share-link.txt` هست، یا بسازید:

</div>

```sh
./examples/client/make-link.sh <uuid> relay.example.com /your-secret-path [clean-ip]
```

<div dir="rtl">

کلاینت باید هستهٔ Xray جدید (26.x) داشته باشه؛ هستهٔ قدیمی `xPaddingObfsMode` رو نمی‌شناسه و `429` می‌گیره.

## آی‌پی تمیز

هر آی‌پی نتلیفای که جواب بده جای Address می‌شینه؛ SNI و Host روی دامنهٔ خودتون می‌مونن:

</div>

```sh
curl -sI --resolve relay.example.com:443:<IP> https://relay.example.com/
```

<div dir="rtl">

## ساب 3x-ui

از نسخهٔ 3.4 به بعد، صفحهٔ **Hosts** هم SNI و هم `extra` (شامل پدینگ هدری) رو داخل ساب می‌فرسته. نسخه‌های قدیمی‌تر نه؛ لینک رو دستی بدید.

## عیب‌یابی

جزئیات در `docs/troubleshooting.md`.

## هشدار

استفاده از سرویس هاستینگ به‌عنوان رله ممکنه خلاف قوانینش باشه و اکانت بسته بشه. پلن رایگان اعتباری‌ه و `packet-up` درخواست زیاد می‌سازه. این رو مسیر دوم نگه دارید و اسم و Path یکتا انتخاب کنید.

## لایسنس

[MIT](LICENSE) © 2026 Amirali

</div>
