const fs = require('fs');
const path = require('path');

function getAllRoutes(dir, fileArray = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const currPath = path.join(dir, file);
    if (fs.statSync(currPath).isDirectory()) {
      fileArray = getAllRoutes(currPath, fileArray);
    } else {
      const isSwaggerRelated = file.split('.').reduce((acc, cur) => {
        if (cur === 'router' || cur === 'swagger') acc += 1;
        return acc;
      }, 0);
      if (isSwaggerRelated) {
        fileArray.push(currPath);
      }
    }
  });
  return fileArray;
}

exports.option = {
  swaggerDefinition: {
    info: {
      description: `${PROJECT} API 서버(${
        process.env.NODE_ENV || 'development'
      }) 테스트용 Swagger입니다.`,
      title: '${PROJECT} API',
      version: '1.0.0',
    },
    host: `${process.env.SWAGGER_HOST}`,
    basePath: `/${process.env.API_VERSION}`,
    produces: ['application/json', 'multipart/form-data'],
    consumes: ['application/json', 'multipart/form-data'],
    schemes: ['http', 'https'],
    // securityDefinitions: {
    //   bearer: {
    //     type: 'apiKey',
    //     in: 'header',
    //     name: 'bearer',
    //     description: '사용자 인증 JWT',
    //   },
    // },
    // security: [{ bearer: [] }],
  },
  basedir: process.env.PWD,
  files: getAllRoutes('./modules/'),
  route: {
    url: `/${process.env.API_VERSION}/api-docs`,
    docs: `/${process.env.API_VERSION}/api-docs.json`,
  },
};
