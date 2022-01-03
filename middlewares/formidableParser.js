const formidable = require('formidable');
const { v4: uuid } = require('uuid');

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
      if (files?.file) {
        if (Array.isArray(files.file)) {
          req.file = files.file[0];
        } else {
          req.file = files.file;
        }
        req.file.fileId = uuid();
      }
      req.body = fields;
      return next();
    });
  } else {
    return next();
  }
};
