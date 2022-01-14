const formidable = require('formidable');
// const { v4: uuid } = require('uuid');

module.exports = async function formidableParser(req, res, next) {
  let contentType = req.headers['content-type'];
  if (contentType) {
    contentType = contentType.split(';')[0];
  }
  if ('multipart/form-data' === contentType) {
    const form = formidable({ multiples: true });
    form.parse(req, (err, fields, files) => {
      if (err) {
        next(err);
        return;
      }
      req.files = files;
      req.body = fields;
      return next();
    });
  } else {
    return next();
  }
};
