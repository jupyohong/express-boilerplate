const crypto = require('crypto');

const CustomError = require('../config/CustomError.js');

module.exports = async function authenticator(req, res, next) {
  const { authorization } = req.headers; // authorization: 'bearer mF_9.B5f-4.1JqM'
  const [type, token] = authorization.split(' ');

  try {
    /* 사용자 인증 토큰 검증 */
    if (type.toLowerCase() !== 'bearer') {
      throw new CustomError(401, '토큰 타입을 확인해주세요.');
    }
    const [header, payload, signature] = token.split('.');
    const testSignature = crypto
      .createHmac('sha256', process.env.JWT_SECRET)
      .update(header + '.' + payload)
      .digest('base64')
      .replace(/\=/g, '');

    if (testSignature !== signature) {
      // 조작된 토큰
      throw new CustomError(401, '토큰 정보가 유효하지 않습니다.');
    }

    // 만료 여부 확인
    const decodedPayload = JSON.parse(
      Buffer.from(payload, 'base64').toString('utf8')
    );

    if (new Date(decodedPayload?.expires_in) < new Date()) {
      // 만료된 토큰
      throw new CustomError(401, '토큰이 만료되었습니다.');
    }

    // 사용자 정보 재활용을 위해 req 객체에 저장
    req.user = decodedPayload;
    return next();
  } catch (err) {
    return next(err);
  }
};
