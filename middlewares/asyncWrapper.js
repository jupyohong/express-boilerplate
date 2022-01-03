const knex = require('../database/knex');

module.exports = function asyncWrapper(fn) {
  return async function (req, res, next) {
    try {
      req.trx = await knex.transaction();
      await fn(req, res, next);
      await req.trx.commit();
      return next();
    } catch (error) {
      await req.trx.rollback();
      return next(error);
    }
  };
};
