const express = require('express');
const cors = require('cors');

const router = require('../modules'); // 엔드포인트 설정
const logger = require('./logger'); // 로그 설정
const { option } = require('./swagger'); // 스웨거 설정
const { formidableParser } = require('../middlewares'); // FormData 처리 미들웨어

const app = express();

// 미들웨어
app.use(express.json()); // JSON 처리 설정
app.use(express.urlencoded({ extended: true })); // URL-encoded 처리 설정
app.use(express.raw()); // Buffer 처리 설정
app.use(express.text());
app.use(cors());
app.use(formidableParser);
app.use(logger);

// 스웨거
const expressSwagger = require('express-swagger-generator')(app);
expressSwagger(option);

// 라우팅
app.use(`/${process.env.API_VERSION}`, router);

module.exports = app;
