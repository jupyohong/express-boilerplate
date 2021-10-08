const formidable = require('formidable');
const path = require('path');
const { uid } = require('../utils');

module.exports = async function formidableParser(req, res, next) {
  let contentType = req.headers['content-type'];
  if (contentType) {
    contentType = contentType.split(';')[0];
  }
  if ('multipart/form-data' === contentType) {
    const form = new formidable.IncomingForm({ multiples: true });
    // console.log('form ==> ', form);
    form
      .parse(req, (err, fields, openedFiles) => {
        if (err) {
          // console.error(err);
          next();
          return;
        }
        if (openedFiles.files) {
          // console.log('openedFiles ==> ', openedFiles);
          const files = Array.isArray(openedFiles.files)
            ? openedFiles.files
            : [openedFiles.files];
          const summary = files.reduce((acc, cur, idx) => {
            if (cur.name) {
              acc.push({
                name: cur.name,
                type: cur.type,
                path: cur.path,
                seq: 0,
                idx: idx,
                file_id: uid({ prefix: 'file' }) + path.extname(cur.name),
              });
            }
            return acc;
          }, []);
          // console.log('summary ==> ', summary);
          req.files = summary;
        }
      })
      .on('field', function (name, field) {
        req.body[name] = field;
      })
      .once('end', () => {
        next();
      });
  } else {
    next();
  }
};
