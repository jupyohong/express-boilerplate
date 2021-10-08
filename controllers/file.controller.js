const { s3 } = require('../utils/s3');

/* S3 파일 */
exports.getS3File = async (req, res) => {
  const { folder, file_id } = req.params;

  // const start = Date.now();
  s3.getObject({
    Bucket: process.env.S3_BUCKET,
    Key: `${folder}/${file_id}`,
  })
    .createReadStream()
    .on('httpHeaders', function (statusCode, headers) {
      res.set('Content-Length', headers['content-length']);
      res.set('Content-Type', headers['content-type']);
      this.response.httpResponse.createUnbufferedStream();
    })
    // .on('end', function () {
    //   const elapsed = Date.now() - start;
    //   console.log('Execution time(ms):', Math.floor(elapsed));
    // })
    .on('error', function (err) {
      throw new Error('S3_ERROR');
    })
    .pipe(res);
};

exports.getS3ResizeFile = async (req, res) => {
  const { folder, file_id } = req.params;

  // const start = Date.now();
  s3.getObject({
    Bucket: process.env.S3_BUCKET,
    Key: `${folder}/resize/${file_id}`,
  })
    .createReadStream()
    .on('httpHeaders', function (statusCode, headers) {
      res.set('Content-Length', headers['content-length']);
      res.set('Content-Type', headers['content-type']);
      this.response.httpResponse.createUnbufferedStream();
    })
    // .on('end', function () {
    //   const elapsed = Date.now() - start;
    //   console.log('Execution time(ms):', Math.floor(elapsed));
    // })
    .on('error', function (err) {
      throw new Error('S3_ERROR');
    })
    .pipe(res);
};
