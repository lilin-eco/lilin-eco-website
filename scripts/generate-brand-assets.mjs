import { mkdir, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

// Approved modern seal: preserve these paths and the open edges when exporting.
const paths = `<path d="M82 22H350Q412 22 412 84V252Q412 276 368 298V93Q368 66 341 66H106Q82 66 82 42Z"/><path d="M65 84H123Q151 84 161 121H94Q65 121 65 84Z"/><path d="M20 146H159Q187 146 181 172Q180 187 162 204L117 249V398Q117 423 145 423H394Q390 465 361 465H135Q73 465 73 405V289L20 333V279L116 190H20Z"/><path d="M143 279Q164 279 164 302V389H122V302Q122 279 143 279Z"/><path d="M192 115H237V295Q237 337 278 337H465Q459 379 429 379H276Q192 379 192 298Z"/>`;
const green = '#36593e';
const paper = '#f8f7f3';
const font = 'Microsoft YaHei, Noto Sans SC, Arial, sans-serif';
const svg = (width, height, content) => `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${content}</svg>`;
const mark = (x, y, scale, fill = green) => `<g fill="${fill}" transform="translate(${x} ${y}) scale(${scale})">${paths}</g>`;
const text = (x, y, size, content, extra = '') => `<text x="${x}" y="${y}" fill="${green}" font-family="${font}" font-size="${size}" ${extra}>${content}</text>`;
await mkdir('src/assets/brand', { recursive: true });
await mkdir('public/brand', { recursive: true });

const horizontal = svg(512, 208,
  mark(8, 8, .375)
  + text(220, 115, 64, '礼林生态', 'font-weight="600"')
  + text(223, 164, 29, 'LILIN ECO', 'letter-spacing="6"'));
await writeFile('public/brand/logo-horizontal-green.svg', horizontal);
// Rasterize the wordmark once so all devices retain the approved typography.
await sharp(Buffer.from(horizontal)).resize(1024, 416).png().toFile('src/assets/brand/logo-horizontal-green.png');

const symbol = svg(512, 512, mark(16, 16, 1));
await writeFile('public/brand/symbol-green.svg', symbol);
await sharp(Buffer.from(symbol)).png().toFile('public/brand/logo-green-512.png');

// Opaque ivory background keeps the small green mark legible in dark browser UI.
const favicon = svg(512, 512, `<rect width="512" height="512" rx="88" fill="${paper}"/>` + mark(40, 40, .9));
await writeFile('public/favicon.svg', favicon);
await writeFile('public/brand/favicon-green.svg', favicon);
await sharp(Buffer.from(favicon)).resize(32, 32).png().toFile('public/brand/favicon-32.png');
const iconPng = await sharp(Buffer.from(favicon)).resize(48, 48).png().toBuffer();
const icoHeader = Buffer.alloc(22);
icoHeader.writeUInt16LE(1, 2); icoHeader.writeUInt16LE(1, 4);
icoHeader[6] = 48; icoHeader[7] = 48;
icoHeader.writeUInt16LE(1, 10); icoHeader.writeUInt16LE(32, 12);
icoHeader.writeUInt32LE(iconPng.length, 14); icoHeader.writeUInt32LE(22, 18);
await writeFile('public/favicon.ico', Buffer.concat([icoHeader, iconPng]));
const touch = svg(512, 512, `<rect width="512" height="512" fill="${green}"/>` + mark(40, 40, .9, paper));
await sharp(Buffer.from(touch)).resize(180, 180).png().toFile('public/brand/apple-touch-icon.png');

const share = svg(1200, 630,
  `<rect width="1200" height="630" fill="${paper}"/>`
  + mark(88, 130, 350 / 480)
  + text(500, 290, 82, '礼林生态', 'font-weight="600"')
  + text(505, 350, 32, 'LILIN ECO', 'letter-spacing="6"')
  + text(505, 435, 29, '善心 · 善念 · 善行'));
await writeFile('public/brand/social-share.svg', share);
await sharp(Buffer.from(share)).png().toFile('src/assets/brand/social-share.png');
console.log('Brand assets exported: green seal and wordmark, browser/touch icons, 1200 × 630 sharing image.');
