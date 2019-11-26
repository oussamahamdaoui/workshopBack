const bcrypt = require('bcrypt');

const BCRYPT_SALT_ROUNDS = 12;

const deepCopy = (obj) => JSON.parse(JSON.stringify(obj));

const hashPassword = async (password) => {
  const hashedPassword = await new Promise((resolve, reject) => {
    bcrypt.hash(password, BCRYPT_SALT_ROUNDS, (err, hash) => {
      if (err) reject(err);
      resolve(hash);
    });
  });

  return hashedPassword;
};

const comparePassword = async (password, hash) => new Promise((resolve, reject) => {
  bcrypt.compare(password, hash, (err, res) => {
    if (err) reject(err);
    if (res) {
      resolve(true);
    } else {
      resolve(false);
    }
  });
});


const withHashedPassword = async (user) => {
  const copy = deepCopy(user);
  copy.password = await hashPassword(copy.password);
  return copy;
};

module.exports = {
  hashPassword,
  deepCopy,
  withHashedPassword,
  comparePassword,
};
