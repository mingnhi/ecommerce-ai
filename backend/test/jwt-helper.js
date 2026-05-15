/**
 * Generate access JWT khớp với cấu hình của AuthModule (Nhi).
 * Ký bằng JWT_ACCESS_SECRET từ .env, payload có `type: 'access'`
 * (AccessTokenStrategy.validate yêu cầu field này).
 */

const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const SEED_FILE = path.join(__dirname, 'seed-result.json');

function signAccessToken({ sub, email, roles }) {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) {
    throw new Error('JWT_ACCESS_SECRET không có trong .env');
  }
  const expiresIn = process.env.JWT_ACCESS_EXPIRATION_TIME || '1d';
  return jwt.sign({ sub, email, roles, type: 'access' }, secret, { expiresIn });
}

function getTestUserToken() {
  if (!fs.existsSync(SEED_FILE)) {
    throw new Error(
      'Chưa có test/seed-result.json — chạy `node test/seed-test-data.js` trước.',
    );
  }
  const seed = JSON.parse(fs.readFileSync(SEED_FILE, 'utf8'));
  return signAccessToken({
    sub: seed.testUser.id,
    email: seed.testUser.email,
    roles: seed.testUser.roles,
  });
}

module.exports = { signAccessToken, getTestUserToken };
