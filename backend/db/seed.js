/**
 * Runs schema.sql against MySQL, then creates (or resets) the
 * default admin account with a properly bcrypt-hashed password.
 *
 * Usage:  npm run seed
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    port: process.env.DB_PORT || 3306,
    multipleStatements: true,
  });

  const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  console.log('Running schema.sql ...');
  await connection.query(sql);
  console.log('Schema created / already up to date.');

  await connection.changeUser({ database: process.env.DB_NAME || 'cyber_goyenda_app' });

  const adminUsername = process.env.DEFAULT_ADMIN_USERNAME || 'admin';
  const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'admin12345';
  const hash = await bcrypt.hash(adminPassword, 10);

  const [existing] = await connection.query(
    'SELECT id FROM admins WHERE username = ?',
    [adminUsername]
  );

  if (existing.length > 0) {
    await connection.query('UPDATE admins SET password = ? WHERE username = ?', [
      hash,
      adminUsername,
    ]);
    console.log(`Default admin "${adminUsername}" already existed - password reset.`);
  } else {
    await connection.query(
      'INSERT INTO admins (username, password) VALUES (?, ?)',
      [adminUsername, hash]
    );
    console.log(`Default admin "${adminUsername}" created.`);
  }

  console.log(`\nAdmin login -> username: ${adminUsername}  password: ${adminPassword}`);
  console.log('Change this password after first login.');

  await connection.end();
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});

