const router = require('express').Router();

const { auth, validator, wrapper } = require('../../middlewares');

const { getS3PresignedUrl } = require('./common.controller');
const {} = require('./common.validator');

router.route('/presigned/:folder/:fileId').get(auth, getS3PresignedUrl);

module.exports = router;
