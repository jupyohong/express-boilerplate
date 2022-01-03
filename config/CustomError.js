class CustomError extends Error {
  constructor(status = 500, message = '서버에서 에러가 발생했습니다.', code) {
    super(message);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CustomError);
    }

    this.code = code || this._rawErrorCode(status);
    this.status = status;
  }

  _rawErrorCode(status) {
    const rawErrorCode = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      500: 'INTERNAL_SERVER_ERROR',
    };

    return rawErrorCode[status];
  }
}

module.exports = CustomError;
