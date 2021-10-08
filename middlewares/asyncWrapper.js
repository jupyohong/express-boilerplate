module.exports = function asyncWrapper(fn) {
  return async function (req, res, next) {
    const { dbPool } = req.app;
    const conn = await dbPool.getConnection();
    try {
      await conn.beginTransaction();
      req.conn = conn;
      await fn(req, res, next);
      await conn.commit();
      next();
    } catch (error) {
      await conn.rollback();
      // console.error(error);
      next(error);
      // next(error);
    } finally {
      conn.release();
    }
  };
};
