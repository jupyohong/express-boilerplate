const express = require('express');
const cors = require('cors');
const app = express();

const dbPool = require('../database/pool');
const expressSwagger = require('express-swagger-generator')(app);
const { option } = require('./swagger');
const logger = require('./logger');

const { common } = require('../middlewares');
const router = require('../routes');

app.dbPool = dbPool;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.raw());
app.use(express.text());
app.use(common);

// 이미지, CSS 파일 및 JavaScript 파일과 같은 정적 파일을 제공하는 Express의 기본 제공 미들웨어 함수
// const path = require('path');
// app.use(express.static('../public'));

app.use(cors());

app.use(logger);
expressSwagger(option);

app.use(`/${process.env.API_VERSION}`, router);

module.exports = app;
