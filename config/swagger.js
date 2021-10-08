const fs = require('fs');
const path = require('path');

function getAllRoutes(dir, fileArray = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const currPath = path.join(dir, file);
    if (fs.statSync(currPath).isDirectory()) {
      fileArray = getAllFiles(currPath, fileArray);
    } else {
      fileArray.push(currPath);
    }
  });
  return fileArray;
}

exports.option = {
  swaggerDefinition: {
    info: {
      description: '프로젝트 설명을 입력해주세요.',
      title: '프로젝트명을 입력해주세요.',
      version: '1.0.0',
    },
    host: `${process.env.SWAGGER_HOST}:${process.env.PORT}/${process.env.API_VERSION}`,
    basePath: '',
    produces: ['application/json', 'multipart/form-data'],
    consumes: ['multipart/form-data'],
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
  files: getAllRoutes('./routes/'),
  route: {
    url: `/${process.env.API_VERSION}/api-docs`,
    docs: `/${process.env.API_VERSION}/api-docs.json`,
  },
};
