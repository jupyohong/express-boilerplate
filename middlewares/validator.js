function validator(schema) {
  return async function validation(req, res, next) {
    try {
      const validationResult = await schema.validateAsync(req);
      next(validationResult.error);
    } catch (err) {
      next(err);
    }
  };
}

module.exports = validator;
