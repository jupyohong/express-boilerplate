const fs = require('fs');
const path = require('path');
const xmldoc = require('./xmldoc_2.2.3.js');

const STR = async (fileName, sqlId, queryParam) => {
  const xmlFileString = fs.readFileSync(
    path.join(__dirname, './sql', fileName),
    'utf8'
  );
  return await xmldoc.queryParser(xmlFileString, sqlId, queryParam);
};

const EXECUTE_DEFAULT = async (fileName, sqlId, queryParam, conn) => {
  const query = await STR(fileName, sqlId, queryParam);
  return await conn.query(query, queryParam); // [rows, fields]
};

const EXECUTE = async (fileName, sqlId, queryParam, conn) => {
  const [rows, fields] = await EXECUTE_DEFAULT(
    fileName,
    sqlId,
    queryParam,
    conn
  );
  return rows;
};

/**
 * 쿼리 자체는 같다는 가정하에 쿼리문 파싱을 한번만 하기위해 존재하는 함수입니다.
 * @param {*} fileName
 * @param {*} sqlId
 * @param {*} paramArray
 * @param {*} conn
 */
const EXECUTE_ARRAY = async (fileName, sqlId, paramArray, conn) => {
  const query = await STR(fileName, sqlId, paramArray[0]);
  const result = [];
  for (let i = 0; i < paramArray.length; i++) {
    const queryParam = paramArray[i];
    const [rows, fields] = await conn.query(query, queryParam);
    result.push(rows);
  }
  return result;
};

exports.STR = STR;
exports.EXECUTE_DEFAULT = EXECUTE_DEFAULT;
exports.EXECUTE = EXECUTE;
exports.EXECUTE_ARRAY = EXECUTE_ARRAY;
