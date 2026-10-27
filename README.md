# Rove website

The website of [Rove](https://rove.hhwyz.com), instant file search for the Mac.
Rove 的官网：Mac 上的即时文件搜索。

- English: <https://rove.hhwyz.com>
- 中文: <https://rove-cn.hhwyz.com>

Plain static HTML and CSS, with no build step and no framework.

## Layout

```
zh/          Chinese pages   →  /zh/
en/          English pages   →  /en/   (same content)
style.css    shared, light and dark following the system (Apple HIG system colors)
icon.png     the app icon
images/      feature illustrations (168×168, shown at 56)
scripts/     check-website.mjs: screenshots and overflow check
```

Each language is one directory with the same file names: `index.html` (features, pricing, FAQ), `buy.html` (Paddle checkout),
`404.html`, and the drafts `terms.html`, `privacy.html`, `refund.html`. Pages refer to the shared files as `../style.css`,
which is `/style.css` once published and works as it is when a page is opened from a checkout. A new language is a new
directory (for example `ja/`) plus a link to it in each page's header.

Both hosts carry every language; the host only decides the default. `rove.hhwyz.com` (Cloudflare) opens `/en/`,
`rove-cn.hhwyz.com` (Alibaba Cloud, fast in mainland China) opens `/zh/`. Nothing switches by the browser's language: the
header switches between languages on the same host.

## Preview and check

Open `zh/index.html` or `en/index.html` in a browser, or serve the directory (`python3 -m http.server`) and open
`/zh/index.html`. Layouts: desktop (≥ 1024, content 1360 wide, designed at 1920), tablet (two columns) and phone (≤ 672: one
column, 44 pt touch targets, no sideways scrolling).

```bash
node scripts/check-website.mjs /tmp/site-check file://$PWD/zh/index.html file://$PWD/en/index.html
```

takes full-page screenshots at 390 and 1920 wide, light and dark, and lists elements wider than the screen.

## Status

- Not released yet: every download and purchase button is disabled and says 敬请期待 / Coming Soon. When Rove opens, the
  download buttons become `<a class="button" href="../download/Rove.dmg">` (relative, so each host serves its own copy),
  the pricing card's button becomes `<a class="button" href="buy.html">`, and the "not ready yet" notes go.
- `buy.html` needs its `CONFIG` (Paddle client token, price id, license service address). The client token and price id
  are public by design.
- The terms, privacy and refund pages are drafts: the seller's name (`[卖家名称]` / `[Seller name]`) and the contact address
  (`support@example.com`) are placeholders, and they are not published or linked yet.

## Publishing

The pages are published together with Rove's downloads and update feed from the main (private) Rove repository, which
takes this repository's `main` branch as it is.
