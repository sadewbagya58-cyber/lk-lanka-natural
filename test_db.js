const mariadb = require('mariadb');
const pool1 = mariadb.createPool('mariadb://u141046951_lklanka123:Lklankanatural2026@localhost:3306/u141046951_l12345');
const pool2 = mariadb.createPool('mariadb://u141046951_lklanka123:Lklankanatural2026@127.0.0.1:3306/u141046951_l12345');
const pool3 = mariadb.createPool('mariadb://u141046951_lklanka123:Lklankanatural2026@srv2052.hstgr.io:3306/u141046951_l12345');

async function test(name, pool) {
  try {
    const conn = await pool.getConnection();
    console.log(name, "SUCCESS!");
    await conn.end();
  } catch (err) {
    console.error(name, "FAILED:", err.message);
  }
}

async function run() {
  await test("localhost", pool1);
  await test("127.0.0.1", pool2);
  await test("srv2052.hstgr.io", pool3);
  process.exit(0);
}
run();
