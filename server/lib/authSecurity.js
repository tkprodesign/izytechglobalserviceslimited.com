'use strict';

const crypto = require('crypto');

const PASSWORD_HASH_PREFIX = 'scrypt';
const PASSWORD_KEY_LENGTH = 64;

function secureEqualStrings(left, right) {
  const leftDigest = crypto.createHash('sha256').update(String(left || '')).digest();
  const rightDigest = crypto.createHash('sha256').update(String(right || '')).digest();
  return crypto.timingSafeEqual(leftDigest, rightDigest);
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(String(password), salt, PASSWORD_KEY_LENGTH).toString('hex');
  return `${PASSWORD_HASH_PREFIX}$${salt}$${derived}`;
}

function verifyPasswordHash(password, encoded) {
  const [prefix, salt, expectedHex] = String(encoded || '').split('$');
  if (prefix !== PASSWORD_HASH_PREFIX || !salt || !/^[0-9a-f]{128}$/i.test(expectedHex || '')) return false;

  const actual = crypto.scryptSync(String(password), salt, PASSWORD_KEY_LENGTH);
  const expected = Buffer.from(expectedHex, 'hex');
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}

function createConfirmationCode() {
  return crypto.randomInt(0, 1_000_000).toString().padStart(6, '0');
}

function confirmationCodeHash({ role, email, code, secret }) {
  return crypto
    .createHmac('sha256', String(secret))
    .update(`${String(role).toLowerCase()}:${String(email).toLowerCase()}:${String(code)}`)
    .digest('hex');
}

function verifyConfirmationCode({ role, email, code, secret, expectedHash }) {
  const actual = confirmationCodeHash({ role, email, code, secret });
  return secureEqualStrings(actual, expectedHash);
}

module.exports = {
  secureEqualStrings,
  hashPassword,
  verifyPasswordHash,
  createConfirmationCode,
  confirmationCodeHash,
  verifyConfirmationCode,
};
