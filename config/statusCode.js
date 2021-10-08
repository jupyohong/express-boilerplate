module.exports = {
  /* 200 Success */
  OK: {
    code: 200,
    subcode: '2000',
    message: 'success',
  },
  /* 400 Bad Request */
  BAD_REQUEST: {
    code: 400,
    subcode: '4000',
    message: '잘못된 요청입니다.',
  },
  INVALID_AUTH: {
    code: 400,
    subcode: '4001',
    message: '인증번호가 유효하지 않습니다.',
  },
  ALREADY_EXISTS: {
    code: 400,
    subcode: '4002',
    message: '이미 등록되었습니다.',
  },
  /* 401 Unauthorized */
  UNAUTHORIZED: {
    code: 401,
    subcode: '4010',
    message: '로그인이 필요한 기능입니다.',
  },
  ALREADY_LOGGED_IN: {
    code: 401,
    subcode: '4011',
    message: '다른 기기에서 로그인되었습니다.',
  },
  /* 403 Forbidden */
  FORBIDDEN: {
    code: 403,
    subcode: '4030',
    message: '접근할 수 없는 권한입니다.',
  },
  /* 404 Not Found */
  NOT_FOUND: {
    code: 404,
    subcode: '4040',
    message: '대상이 존재하지 않습니다.',
  },
  /* 405 Method Not Allowed */
  METHOD_NOT_ALLOWED: {
    code: 405,
    subcode: '4050',
    message: '허용되지 않은 메소드입니다.',
  },
  /* 409 Conflict */
  CONFLICT: {
    code: 409,
    subcode: '4090',
    message: '업데이트 도중 충돌이 발생했습니다.',
  },
  /* 500 Internal Server Error */
  FINAL: {
    code: 500,
    subcode: '5000',
    message: '서버 내부 오류 발생',
  },
  DATABASE_ERROR: {
    code: 500,
    subcode: '5001',
    message: '데이터베이스 오류',
  },
  REDIS_ERROR: {
    code: 500,
    subcode: '5002',
    message: 'Redis 장애',
  },
  S3_ERROR: {
    code: 500,
    subcode: '5003',
    message: 'AWS S3 처리 오류',
  },
  NCP_ERROR: {
    code: 500,
    subcode: '5004',
    message: 'Naver Cloud Platform 서버 통신 오류',
  },
  MAIL_SERVER_ERROR: {
    code: 500,
    subcode: '5005',
    message: '메일 전송 실패',
  },
  SMS_SERVER_ERROR: {
    code: 500,
    subcode: '5006',
    message: 'SMS 전송 실패',
  },
};
