'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  secureEqualStrings,
  hashPassword,
  verifyPasswordHash,
  createConfirmationCode,
  confirmationCodeHash,
  verifyConfirmationCode,
} = require('../lib/authSecurity');

test('password hashes verify only the correct password', () => {
  const encoded = hashPassword('StrongPassword!42');
  assert.match(encoded, /^scrypt\$/);
  assert.equal(verifyPasswordHash('StrongPassword!42', encoded), true);
  assert.equal(verifyPasswordHash('WrongPassword!42', encoded), false);
});

test('confirmation codes are six digits and HMAC verified', () => {
  const code = createConfirmationCode();
  assert.match(code, /^\d{6}$/);

  const input = {
    role: 'admin',
    email: 'admin@example.com',
    code,
    secret: 'unit-test-secret',
  };
  const expectedHash = confirmationCodeHash(input);
  assert.equal(verifyConfirmationCode({ ...input, expectedHash }), true);
  assert.equal(verifyConfirmationCode({ ...input, code: code === '000000' ? '000001' : '000000', expectedHash }), false);
});

test('constant-time string helper compares values correctly', () => {
  assert.equal(secureEqualStrings('same', 'same'), true);
  assert.equal(secureEqualStrings('same', 'different'), false);
});
