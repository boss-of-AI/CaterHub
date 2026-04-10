const { Pool } = require('pg');
require('dotenv').config();

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  const admins = await pool.query('SELECT email FROM "Admin"');
  const caterers = await pool.query('SELECT username, name FROM "Caterer"');
  const customers = await pool.query('SELECT email FROM "Customer"');

  console.log('\n👤 Admins:', admins.rows);
  console.log('\n🧑‍🍳 Caterers:', caterers.rows);
  console.log('\n🙋 Customers:', customers.rows);

  await pool.end();
}

main().catch(console.error);
