const router = require('express').Router();

const commonRouter = require('./common/common.router');

router.use('/', commonRouter);

module.exports = router;
