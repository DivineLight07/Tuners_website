const http = require('http');
const urls = ['/', '/home', '/about', '/apply', '/courses', '/login', '/admin', '/member'];
(async () => {
  for (const u of urls) {
    await new Promise((resolve) => {
      const req = http.get({ hostname: '127.0.0.1', port: 5000, path: u, timeout: 2000 }, (res) => {
        console.log(u, res.statusCode);
        res.resume();
        resolve();
      });
      req.on('error', (e) => {
        console.log(u, 'ERROR', e.message);
        resolve();
      });
      req.on('timeout', () => {
        console.log(u, 'TIMEOUT');
        req.abort();
        resolve();
      });
    });
  }
})();
