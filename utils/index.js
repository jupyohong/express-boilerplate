const crypto = require('crypto');

const ALPHANUMERIC = [
  ...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
];
const ALPHABET = [...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'];
const NUMBER = [...'0123456789'];
const SPECIAL = [...'!@#$%^&+='];
const REGEX = {
  image: /^image\//,
  uuid: '\\b[0-9a-f]{8}\\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\\b[0-9a-f]{12}\\b',
};

const shuffle = array => {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

/**
 * @description 임시 비밀번호 생성 로직
 * 문자, 숫자, 특수문자 각 최소 하나 포함 8~16자 생성
 * 문자 2 : 숫자 1 : 특수문자 1 의 비율로 생성
 */
const randomPassword = strLength => {
  const alphaLength = Math.floor(strLength * 0.5);
  const numberLength = Math.floor(strLength * 0.25);

  const newAlpha = [...Array(alphaLength)]
    .map(() => ALPHABET[Math.floor(Math.random() * ALPHABET.length)])
    .join('');

  const newNumber = [...Array(numberLength)]
    .map(() => NUMBER[Math.floor(Math.random() * NUMBER.length)])
    .join('');

  const newSpecial = [...Array(numberLength)]
    .map(() => SPECIAL[Math.floor(Math.random() * SPECIAL.length)])
    .join('');

  const newPassword = newAlpha + newNumber + newSpecial;
  return shuffle([...newPassword]).join('');
};

const randomStr = strLength => {
  return [...Array(strLength)]
    .map(() => ALPHANUMERIC[Math.trunc(Math.random() * ALPHANUMERIC.length)])
    .join('');
};

const randomNumber = (strLength = 6) => {
  const randNums = [...Array(strLength)]
    .map(() => NUMBER[Math.floor(Math.random() * NUMBER.length)])
    .join('');

  return shuffle([...randNums]).join('');
};

const pagination = (totalCount = 0, requestedPage = 1, perPage = 10) => {
  let totalData = Number(totalCount);
  let currentPage = Number(requestedPage);
  let dataPerPage = Number(perPage);
  let totalPages = Math.ceil(totalData / perPage);
  let startRow = currentPage > 1 ? currentPage * perPage - perPage : 0;
  return {
    totalData, // the number of data
    currentPage, // current page number
    dataPerPage, // the number of data per page
    totalPages, // the number of total pages
    startRow, // SQL LIMIT offset
  };
};

const getJWT = (payload = {}) => {
  const header = {
    alg: 'HS256',
    typ: 'JWT',
  };
  const encodedHeader = Buffer.from(JSON.stringify(header), 'utf8')
    .toString('base64')
    .replace(/\=/g, '');
  const encodedPayload = Buffer.from(JSON.stringify(payload), 'utf8')
    .toString('base64')
    .replace(/\=/g, '');
  const signature = crypto
    .createHmac('sha256', process.env.JWT_SECRET)
    .update(encodedHeader + '.' + encodedPayload)
    .digest('base64')
    .replace(/\=/g, '');
  return encodedHeader + '.' + encodedPayload + '.' + signature;
};

const getSHA256 = (str = '') => {
  return crypto.createHash('sha256').update(str).digest('hex');
};

const getUTCDate = (offset = 0) => {
  let date = new Date();
  date.setDate(date.getDate() + parseInt(offset));
  return date.toISOString().replace(/\..+/, '').replace(/T/, ' ');
};

/**
 * @description 현재 날짜와 오프셋 일수의 차이만큼의 일시를 KST 기준으로 반환하는 함수
 * @param {integer} offset 오프셋 일수
 * @returns {string} YYYY-MM-DD hh:mm:ss
 */
const getKSTDate = (offset = 0) => {
  let date = new Date();
  date.setDate(date.getDate() + parseInt(offset));
  // const utcDate = date.getTime() + date.getTimezoneOffset() * 60 * 1000
  const kstOffset = 9 * 60 * 60 * 1000;
  return new Date(date.getTime() + kstOffset)
    .toISOString()
    .replace(/\..+/, '')
    .replace(/T/, ' ');
};

const parseBool = value => {
  if ([true, 'true', 1, '1'].includes(value)) {
    return true;
  } else if ([false, 'false', 0, '0'].includes(value)) {
    return false;
  } else {
    return false;
  }
};

module.exports = {
  REGEX,
  randomPassword,
  randomStr,
  randomNumber,
  pagination,
  getJWT,
  getSHA256,
  getUTCDate,
  getKSTDate,
  parseBool,
};
