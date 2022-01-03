const Joi = require('joi'); // npm i joi

const CustomError = require('../config/CustomError');

exports.pageInfoSchema = Joi.object({
  query: Joi.object({
    page: Joi.number()
      .integer()
      .min(1)
      .error(new CustomError(400, '페이지 번호가 유효하지 않습니다.')),
    perPage: Joi.number()
      .integer()
      .min(0)
      .error(new CustomError(400, '페이지당 객체 수가 유효하지 않습니다.')),
  }).unknown(true),
}).unknown(true);
