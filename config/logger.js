const morgan = require('morgan');
const apiPrefixes = [`/${process.env.API_VERSION}`];
const skippedPaths = [`/${process.env.API_VERSION}/api-docs`];

module.exports = morgan(
  (tokens, req, res) => {
    return [
      `[${tokens.date(req, res, 'iso').replace(/\..+/, '').replace(/T/, ' ')}]`,
      `[${tokens.status(req, res)}]`,
      `[${tokens.method(req, res)} ${tokens.url(req, res)}]`,
      `[${tokens.req(req, res, 'userid')}]`,
      `[${tokens.req(req, res, 'targetid')}]`,
      `[${req.query.q}]`,
    ].join('');
  },
  {
    skip: (req, res) => {
      return (
        !apiPrefixes.some(path => req.originalUrl.startsWith(path)) ||
        skippedPaths.some(path => req.originalUrl.startsWith(path))
      );
    },
  }
);
