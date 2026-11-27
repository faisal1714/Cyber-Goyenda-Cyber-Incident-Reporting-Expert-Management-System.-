const test = require('node:test');
const assert = require('node:assert');
process.env.JWT_SECRET = 'test_secret';
const { signToken, verifyToken } = require('../utils/jwt');

test('sign and verify round trip keeps the payload', () => {
  const token = signToken({ id: 1, type: 'expert' });
  const decoded = verifyToken(token);
  assert.strictEqual(decoded.id, 1);
  assert.strictEqual(decoded.type, 'expert');
});

test('tampered token is rejected', () => {
  const token = signToken({ id: 1, type: 'user' });
  assert.throws(() => verifyToken(token.slice(0, -2) + 'xx'));
});
