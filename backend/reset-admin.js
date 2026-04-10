/**
 * Minimal admin reset script using raw pg query to avoid Prisma client issues.
 * Run: node reset-admin.js
 */
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  console.log('🔍 Checking admin table...');
  const existing = await pool.query('SELECT id, email, name FROM "Admin" LIMIT 5');
  console.log('Existing admins:', existing.rows);

  if (existing.rows.length === 0) {
    console.log('\n🔧 No admin found. Creating admin@caterme.com...');
    const hashed = await bcrypt.hash('mumbai2026', 10);
    await pool.query(
      `INSERT INTO "Admin" (id, email, name, password, "createdAt", "updatedAt") 
       VALUES (gen_random_uuid(), $1, $2, $3, NOW(), NOW())`,
      ['admin@caterme.com', 'Mumbai Admin', hashed]
    );
    console.log('✅ Admin created! Login: admin@caterme.com / mumbai2026');
  } else {
    console.log('\n✅ Admin already exists:', existing.rows[0].email);
    console.log('\n🔧 Resetting password to: mumbai2026');
    const hashed = await bcrypt.hash('mumbai2026', 10);
    await pool.query('UPDATE "Admin" SET password = $1 WHERE email = $2', [hashed, 'admin@caterme.com']);
    console.log('✅ Password reset done!');
  }

  await pool.end();
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
