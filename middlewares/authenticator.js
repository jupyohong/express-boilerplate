const redis = require('../database/redis');

module.exports = async function authenticator(req, res, next) {
  // const { redis } = req.app;
  const { userid, accesstoken } = req.headers;

  // null은 JSON.parse 가능하지만 undefined는 안 된다.
  const user = JSON.parse(await redis.getAsync(userid));
  if (!user) {
    next(new Error('LOGIN_REQUIRED'));
  } else if (user.access_token !== accesstoken) {
    next(new Error('ALREADY_LOGGED_IN'));
  }

  req.user = user;
  next();
};
