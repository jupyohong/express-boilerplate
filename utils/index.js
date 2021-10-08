const crypto = require('crypto');
const util = require('util');

const chars = [
  ...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
];
const uuidRegexString =
  '\\b[0-9a-f]{8}\\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\\b[0-9a-f]{12}\\b';

function randomStr(strLength) {
  return [...Array(strLength)]
    .map(() => chars[Math.trunc(Math.random() * chars.length)])
    .join('');
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array.join('');
}

/**
 * @description 임시 비밀번호 생성 로직
 * 문자, 숫자, 특수문자 각 최소 하나 포함 8~16자 생성
 * 문자 2 : 숫자 1 : 특수문자 1 의 비율로 생성
 */
const ALPHABET = [...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'];
const NUMBER = [...'0123456789'];
const SPECIAL = [...'!@#$%^&+='];

function randomPassword(strLength) {
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
  return shuffle([...newPassword]);
}

function randomNumber(strLength = 6) {
  const randNums = [...Array(strLength)]
    .map(() => NUMBER[Math.floor(Math.random() * NUMBER.length)])
    .join('');

  return shuffle([...randNums]);
}

function uid(options = {}) {
  const now = String(Date.now());
  const middlePos = Math.ceil(now.length / 2);
  let output = `${now.substr(0, middlePos)}-${randomStr(
    options.strLength || 6
  )}-${now.substr(middlePos)}`;
  if (options.prefix) output = `${options.prefix}-${output}`;
  return output;
}

function VPageUtils(totalCount = 0, reqPage = 1, pagePerNum = 5) {
  let totalPages = Number(totalCount);
  let requestPage = Number(reqPage);
  let perNumber = Number(pagePerNum);
  let startRow = requestPage > 1 ? requestPage * perNumber - perNumber : 0;
  let page_total = Math.ceil(totalPages / perNumber); // 바닥에 깔리는 페이지 넘버링의 갯수를 의미
  return {
    startRownum: Number(startRow),
    page_per_num: perNumber,
    currentPage: requestPage,
    page_total,
    rows: totalPages,
  };
}

function getAccessToken(str) {
  return crypto
    .createHash('sha512')
    .update(`${Date.now()}${str}`)
    .digest('base64');
}

function getSha256(str = '') {
  return crypto.createHash('sha256').update(str).digest('base64');
}

function pagination(page = 1, getCount = 10) {
  let startRow = (Number(page) - 1) * Number(getCount);
  return [startRow, getCount];
}

function emailKeygen() {
  return Math.random().toString(36).substr(2);
}

function logging(code, user_id, function_name, params) {
  let now = new Date().toISOString().replace(/\..+/, '').replace(/T/, ' ');
  let log = util.format(
    '[%s][%s][%s][%s][%s]',
    now,
    code,
    user_id,
    function_name,
    params
  );
  console.log(log);
}

/**
 * @description 현재 날짜로부터 주어진 일수가 경과한 날짜를 반환하는 함수
 * @param {integer} offset 경과일
 * @returns {string} (현재 날짜 + 경과일)의 ISO 형식의 날짜
 */
function getDate(offset) {
  let result = new Date(Date.now() + 1000 * 60 * 60 * 24 * parseInt(offset))
    .toISOString()
    .replace(/\..+/, '')
    .replace(/T/, ' ');
  return result;
}

function getKSTDate() {
  const currentDate = new Date();
  const utcDate =
    currentDate.getTime() + currentDate.getTimezoneOffset() * 60 * 1000;
  const kstOffset = 9 * 60 * 60 * 1000;
  return new Date(utcDate + kstOffset);
}

function getKSTISOString() {
  const currentDate = new Date();
  const utcDate =
    currentDate.getTime() + currentDate.getTimezoneOffset() * 60 * 1000;
  const kstOffset = 9 * 60 * 60 * 1000;
  const kstISO = new Date(utcDate + kstOffset)
    .toISOString()
    .replace(/\..+/, '')
    .replace(/T/, ' ');
  return kstISO;
}

exports.uuidRegexString = uuidRegexString;
exports.getKSTDate = getKSTDate;
exports.getKSTISOString = getKSTISOString;
exports.randomStr = randomStr;
exports.randomPassword = randomPassword;
exports.randomNumber = randomNumber;
exports.uid = uid;
exports.VPageUtils = VPageUtils;
exports.getAccessToken = getAccessToken;
exports.getSha256 = getSha256;
exports.pagination = pagination;
exports.emailKeygen = emailKeygen;
exports.logging = logging;
exports.getDate = getDate;
