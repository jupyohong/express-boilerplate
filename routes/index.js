const { Router } = require('express');
const file = require('./file.router');

const router = Router();

router.use('/file', file);

module.exports = router;
