# Express Boilerplate

본 템플릿 저장소는 Node.js 기반의 Express 프레임워크를 기반으로 작성되었습니다.

## How to start

로컬 환경 기준으로 작성되었습니다. 당사 서버 설정 가이드를 따르거나, 필요한 구성 요소들을 설치한 뒤 설정합니다.

### `.env`

로컬 환경, 또는 필요에 따라 클라우드 환경 변수에 값을 채워넣습니다.

```sh
# 프로젝트 설정
PROJECT_NAME=express-boilerplate
API_VERSION=v1  # API 버전
SWAGGER_HOST=localhost  # Swagger 도메인

# RDS 설정
DB_HOST=localhost
DB_PORT=3306
DB_USER=admin
DB_PASS=db_password
DB_NAME=database_name

# Redis 설정
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASS=redis_password

# AWS S3 설정
BUCKET_REGION=aws_s3_bucket_region
S3_ACCESS_KEY_ID=aws_s3_access_key_id
S3_SECRET_ACCESS_KEY=aws_s3_secret_access_key
S3_BUCKET=aws_s3_bucket_name
```

### Commands

```sh
npm install
npm start
```

## Architecture

### Directories

```sh
project
├─📂config  # 환경변수 및 express 설정
│  ├─config.js
│  ├─CustomError.js
│  ├─express.js
│  ├─firebase.js
│  ├─JWTPayload.js
│  ├─logger.js
│  ├─statusCode.js
│  └─swagger.js
├─📂database  # 데이터베이스 설정
│  ├─knex.js
│  └─redis.js
├─📂middlewares # 미들웨어
│  ├─asyncWrapper.js
│  ├─authenticator.js
│  ├─formidableParser.js
│  └─index.js
├─📂modules # 기능 모듈
│  ├─📂common
│  │  ├─common.controller.js  # 컨트롤러 레이어
│  │  ├─common.router.js  # 라우터
│  │  ├─common.service.js # 서비스 레이어(비즈니스 로직)
│  │  ├─common.swagger.js # 스웨거
│  │  └─common.validator.js # 입력 유효성 검증
│  └─index.js
├─📂utils # 유틸 모듈
└─server.js # 서버 엔트리 포인트
```

### Database

#### Knex

[Knex](https://knexjs.org/)를 사용해 데이터베이스에 접근합니다. `knex` 모듈은 그 자체로 configuration 객체를 받는 함수입니다. 전달받은 configuration은 캐싱되며 모든 연결에 재사용됩니다.

##### Connection

Connection pool은 클라이언트 내부적으로 [tarn.js](https://github.com/vincit/tarn.js) 라이브러리를 사용해 만들어집니다. MySQL 기본값은 `min: 2, max: 10`으로 설정되어 있습니다. Connection pool을 제거하려면 `knex.destroy([callback])`을 사용하세요. 콜백 또는 프로미스 체이닝 중 한 가지를 사용하시기 바랍니다.

##### Options

`asyncStackTraces`가 `true`일 경우 query builder, raw query, schema builder를 사용할 때 호출 순서를 기억합니다. DB 드라이버에서 에러가 발생할 경우 호출 순서(스택)를 새로 생성하는 대신 기존 스택을 사용합니다. 이는 node.js/V8가 스택을 날려버리는 await 특성을 막기 때문에 운영 시에는 기본 옵션 상태인 `false`로 하는 것을 권장합니다.

#### Redis

Redis 모듈은 내장 함수인 `util.promisify`를 사용해 비동기 함수화를 해줍니다.

### Middlewares

#### asyncWrapper

트랜잭션을 생성하고 해당 트랜잭션에 대해 Commit & Rollback을 수행하는 미들웨어입니다. 생성한 트랜잭션을 비즈니스 로직 레이어로 넘겨주기 위해 `req` 객체의 `trx` 속성값에 할당합니다.

#### authenticator

사용자 인증 미들웨어입니다. 본 템플릿에서는 JWT를 인증 토큰으로 받아 처리합니다.

#### formidableParser

서버를 통해 binary 파일을 받을 경우 `content-type`이 `multipart/form-data`인 요청을 처리하기 위해 필요한 미들웨어입니다.

### Module Layers

Routing으로 애플리케이션 엔드포인트와 1:1 연결된 컨트롤러는 다수의 서비스를 사용할 수 있으며, 각 서비스는 트랜잭션 객체(`req.trx`)를 넘겨 받아 데이터베이스에 접근합니다.

```
Controller Layer <=> Service Layer(Data Access Layer)
```

#### Controller Layer: HTTP 통신

컨트롤러 레이어에서는 서비스 레이어을 호출해 비즈니스 로직을 수행하고 HTTP 통신을 처리합니다.

```js
// user.controller.js
const { createUser } = require('../services/user.service');
const { generateAuthTokens } = require('../services/token.service');
const { loginUserWithEmailAndPassword } = require('../services/auth.service');

const register = async (req, res) => {
  const userId = await createUser(req.trx, req.body);
  const tokens = await generateAuthTokens(req.trx, user);
  res.status(200).send({ userId, tokens });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await loginUserWithEmailAndPassword(req.trx, email, password);
  const tokens = await generateAuthTokens(user);
  res.status(200).send({ user, tokens });
};

module.exports = {
  register,
  login,
};
```

#### Service Layer: 비즈니스 로직

서비스 레이어에서는 컨트롤러 레이어에서 넘겨받은 인자를 바탕으로 쿼리 빌더(`knex`)를 사용해 데이터베이스에 접근하고 비즈니스 로직을 수행한 뒤 결과를 컨트롤러 레이어로 반환합니다.

```js
// user.service.js
const { v4: uuid } = require('uuid'); // npm i uuid
const CustomError = require('../config/CustomError');
/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const createUser = async (trx, userBody) => {
  // const [{ isEmailTake }] = await trx.raw(`SELECT IFNULL(COUNT(user_id), 0) FROM user WHERE email = ${userBody.email} AND deleted IS NULL LIMIT 1`);
  const { isEmailTaken } = await trx('user')
    .where({ email: userBody.email })
    .whereNull('deleted')
    .select({ isEmailTaken: trx.raw(`ifnull(count(user_id), 0)`) })
    .first();
  if (isEmailTaken) {
    throw new CustomError(400, 'Email already taken');
  }
  const userId = uuid();
  userBody.user_id = userId;
  await trx('user').insert(userBody);
  return userId;
};

module.exports = {
  createUser,
};
```

#### Validator

[Joi 라이브러리](https://joi.dev/api/?v=17.5.0)를 사용해 `req` 입력값에 대한 유효성 검증을 진행할 수 있습니다.

#### Swagger

`express-swagger-generator` 라이브러리를 사용해 Swagger 페이지를 제작하며 `*.router.js` 파일에 표시될 값들을 설정할 수 있습니다.

```js
// 예시
router
  .route('/')
  /**
   * 정비 예약 생성
   * @group Order - 정비 예약
   * @route POST /orders
   * @param {string} authorization.header.required - 사용자 인증 토큰
   * @param {PostOrdersRequest.model} data.body.required
   * @returns {PostOrdersResponse.model} 200 - OK
   */
  .post(auth, validator(postOrdersSchema), wrapper(postOrders))
  /**
   * 정비 예약 목록 조회
   * @group Order - 정비 예약
   * @route GET /orders
   * @param {string} authorization.header.required - 사용자 인증 토큰
   * @param {string} page.query - 페이지 번호
   * @param {string} perPage.query - 페이지당 객체 수
   * @returns {GetOrdersResponse.model} 200 - OK
   */
  .get(auth, validator(getOrdersSchema), wrapper(getOrders));
```

### Utils

자주 사용하는 기능들을 모아놓은 소스 코드입니다.

#### S3

Presigned URL을 사용해 AWS S3에 이미지를 업로드(PUT)하거나, 다운로드(GET)합니다.
