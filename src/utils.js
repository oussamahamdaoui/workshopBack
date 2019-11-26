const bcrypt = require('bcrypt');
const { sign, verify } = require('jsonwebtoken');
const conf = require('./conf');

const deepCopy = (obj) => JSON.parse(JSON.stringify(obj));

const hashPassword = async (password) => {
  const hashedPassword = await new Promise((resolve, reject) => {
    bcrypt.hash(password, conf.SALT_ROUNDS, (err, hash) => {
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

/**
 *
 * @param {Object} details
 * @param {Object} details.sessionData
 * @param {Number} details.maxAge
 * @param {String} details.secret
 * @return {String}
 *
 */

const createJWToken = (details) => {
  let { sessionData, maxAge, secret } = details;

  if (!sessionData || typeof sessionData !== 'object') {
    sessionData = {};
  }
  if (!maxAge || typeof maxAge !== 'number') {
    maxAge = conf.JWT_MAX_AGE;
  }

  if (!secret || typeof secret !== 'string') {
    secret = conf.JWT_SECRET;
  }
  const token = sign({
    data: sessionData,
  }, secret, {
    expiresIn: maxAge,
    algorithm: 'HS256',
  });

  return token;
};

const verifyJWTToken = (token, secret = conf.JWT_SECRET) => {
  try {
    return verify(token, secret);
  } catch (e) {
    return false;
  }
};

const verifyJWTMiddlewear = (req, res, next) => {
  const token = (req.method === 'POST') ? req.body.token : req.query.token;
  const decodedToken = verifyJWTToken(token);
  if (decodedToken) {
    req.user = decodedToken.data;
    next();
  } else {
    res.status(400).json({
      error: true,
    });
  }
};

const safe = (data) => {
  const copy = deepCopy(data);
  delete copy.password;
  delete copy.__v;
  return copy;
};


module.exports = {
  hashPassword,
  deepCopy,
  withHashedPassword,
  comparePassword,
  createJWToken,
  verifyJWTToken,
  verifyJWTMiddlewear,
  safe,
};
