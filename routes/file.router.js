const { Router } = require('express');
const { auth, validator, wrapper } = require('../middlewares');

const {
  getS3File,
  getS3ResizeFile,
} = require('../controllers/file.controller');

const router = Router();

router
  .route('/:folder/:file_id')
  /**
   * S3 파일 가져오기
   * @group Common - 공용
   * @route GET /file/{folder}/{file_id}
   * @param {string} folder.path.required - user / truck / repairshop / reservation / community
   * @param {string} file_id.path.required - 파일 id
   * @returns {file} 200 - S3 파일 스트림
   */
  .get(getS3File);

router
  .route('/:folder/resize/:file_id')
  /**
   * Resize S3 파일 가져오기
   * @group Common - 공용
   * @route GET /file/{folder}/resize/{file_id}
   * @param {string} folder.path.required - user / truck / repairshop / reservation / community
   * @param {string} file_id.path.required - 파일 id
   * @returns {file} 200 - S3 파일 스트림
   */
  .get(getS3ResizeFile);

module.exports = router;
