const asyncWrapper = require('./asyncWrapper');
const authenticator = require('./authenticator');
const formidableParser = require('./formidableParser');
const validator = require('./validator');
const { authSchema } = require('../validations/common.validation');

exports.common = [formidableParser];
exports.auth = [validator(authSchema), authenticator];
exports.validator = validator;
exports.wrapper = asyncWrapper;
