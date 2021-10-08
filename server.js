process.env.PWD = __dirname;

require('dotenv').config();
const fs = require('fs');
const app = require('./config/express');
const statusCode = require('./config/statusCode');

app.set('port', process.env.PORT || 8001);
let isDisableKeepAlive = false;
app.use((req, res, next) => {
  if (isDisableKeepAlive) {
    res.set('Connection', 'close');
  }
  next();
});

// 에러 핸들링
app.use((err, req, res, next) => {
  console.error(err);
  const error = statusCode[err.message] || statusCode.FINAL;
  res.status(error.code).json(error);
  if (req.files) {
    req.files.forEach(file => {
      fs.unlinkSync(file.path);
    });
  }
  return;
});

// 서버 프로세스 시작
const server = app.listen(app.get('port'), () => {
  process.send('ready');
  console.log(`Server started on port ${app.get('port')}`);
});

// 처리되지 않은 에러 핸들링
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at: ', promise, '\nReason:', reason);
});

// 프로세스 재시작
process.on('SIGINT', () => {
  isDisableKeepAlive = true;
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

module.exports = server;
