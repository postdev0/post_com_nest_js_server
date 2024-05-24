const crypto = require('crypto');

export const otpGenerator = () => {
  return crypto.randomInt(100000, 999999).toString();
};

export const sixDigitGenerator = () => {
  return crypto.randomInt(100000, 999999).toString();
};
