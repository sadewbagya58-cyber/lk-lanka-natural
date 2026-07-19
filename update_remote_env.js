const { Client } = require('ssh2');

const conn = new Client();
const envContent = `NEXTAUTH_SECRET='hostinger_market_place_auth_secret_secure_key_32_chars'
NEXTAUTH_URL='https://kllankanatural.com'
AUTH_URL='https://kllankanatural.com'
AUTH_SECRET='hostinger_market_place_auth_secret_secure_key_32_chars'
DATABASE_URL='mysql://u141046951_lklanka123:Lklankanatural2026@127.0.0.1:3306/u141046951_l12345'
`;

const base64Content = Buffer.from(envContent).toString('base64');

conn.on('ready', () => {
  conn.exec(`echo "${base64Content}" | base64 -d > /home/u141046951/domains/kllankanatural.com/public_html/.builds/config/.env`, (err, stream) => {
    if (err) {
      console.error("Exec error:", err);
      process.exit(1);
    }
    stream.on('close', (code) => {
      console.log("Successfully wrote .builds/config/.env using base64 decoding! Exit code:", code);
      conn.end();
      process.exit(0);
    }).on('data', (data) => {
      process.stdout.write(data);
    }).stderr.on('data', (data) => {
      process.stderr.write(data);
    });
  });
}).on('error', (err) => {
  console.error("Connection error:", err);
  process.exit(1);
}).connect({
  host: '145.79.25.43',
  port: 65002,
  username: 'u141046951',
  password: '12345Qw/',
});
