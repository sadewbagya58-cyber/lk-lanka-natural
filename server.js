/* eslint-disable @typescript-eslint/no-require-imports */
const { createServer } = require('http');
const parseurl = require('parseurl');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';

// Support both numeric ports and Hostinger Phusion Passenger Unix socket paths
const port = process.env.PORT || 3000;

const app = next({ dev, customServer: true });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parseurl(req);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  }).listen(port, () => {
    console.log(`> Hostinger Next.js server listening on ${port}`);
  });
}).catch((err) => {
  console.error('Failed to start Next.js production server:', err);
  process.exit(1);
});
