const morgan = require('morgan');
const apiPrefixes = [`/${process.env.API_VERSION}`];
const skippedPaths = [`/${process.env.API_VERSION}/api-docs`];

module.exports = morgan(
  (tokens, req, res) => {
    return [
      `[${tokens.date(req, res, 'iso').replace(/\..+/, '').replace(/T/, ' ')}]`, // Requested datetime
      `[${tokens.status(req, res)}]`, // HTTP Status Code
      `[${tokens.method(req, res)} ${tokens.url(req, res)}]`, // HTTP method
      `[${req?.user?.id || 'unauthorized'}]`, // Client
      `[${tokens['response-time'](req, res)}ms]`, // Response time(ms)
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
