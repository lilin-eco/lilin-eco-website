import https from 'node:https';
import { SITE, validateUrl } from './core.mjs';

export function pushToBaidu(url, token, requestImpl = https.request) {
  validateUrl(url);
  if (!token || !/^[A-Za-z0-9_-]+$/.test(token)) throw new Error('Missing or invalid BAIDU_PUSH_TOKEN secret');
  // Baidu documents data.zz.baidu.com over HTTP. Its HTTPS certificate currently
  // fails hostname validation. The same Baidu API is reachable over verified TLS
  // at ziyuan.baidu.com using its data API virtual host. Keep SNI/certificate
  // validation bound to ziyuan.baidu.com; never disable TLS or fall back to HTTP.
  return new Promise((resolve, reject) => {
    const body = url + '\n';
    const request = requestImpl({
      hostname: 'ziyuan.baidu.com', servername: 'ziyuan.baidu.com', port: 443,
      // Baidu expects the literal verified site value in this query parameter.
      path: `/urls?site=${SITE}&token=${encodeURIComponent(token)}`,
      method: 'POST', headers: { Host: 'data.zz.baidu.com', 'Content-Type': 'text/plain; charset=utf-8',
        'Content-Length': Buffer.byteLength(body) },
    }, response => {
      let data = '';
      response.setEncoding('utf8');
      response.on('data', chunk => {
        data += chunk;
        if (data.length > 65536) response.destroy(new Error('Response too large'));
      });
      response.on('error', () => reject(new Error('Baidu response interrupted; URL remains pending')));
      response.on('end', () => {
        // Do not print response text: an upstream error could echo the request token.
        try {
          const result = JSON.parse(data);
          if (response.statusCode !== 200 && !result.error) throw new Error();
          resolve(result);
        } catch { reject(new Error('Invalid Baidu response; URL remains pending')); }
      });
    });
    request.setTimeout(20000, () => request.destroy());
    request.on('error', () => reject(new Error('Baidu HTTPS request failed; URL remains pending')));
    request.end(body);
  });
}
