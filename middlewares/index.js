const Joi = require('joi');

const CustomError = require('../config/CustomError');

const asyncWrapper = require('./asyncWrapper');
const authenticator = require('./authenticator');
const formidableParser = require('./formidableParser');

function validator(schema) {
  return async function validate(req, res, next) {
    try {
      const validation = await schema.validateAsync(req);
      next(validation.error);
      return;
    } catch (err) {
      next(err);
      return;
    }
  };
}

const authSchema = Joi.object({
  headers: Joi.object({
    authorization: Joi.string()
      .required()
      .error(new CustomError(401, '인증 토큰이 필요합니다.')),
  }).unknown(true),
}).unknown(true);

exports.auth = [validator(authSchema), authenticator];
exports.wrapper = asyncWrapper;
exports.formidableParser = formidableParser;
exports.validator = validator;
