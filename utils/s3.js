const S3 = require('aws-sdk/clients/s3');
const fs = require('fs');
const sharp = require('sharp');
const { RESIZE_FOLDER } = require('../config/config');
const s3 = new S3({
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  region: process.env.BUCKET_REGION,
});

/**
 * @description S3에 원본과 리사이즈 모두 업로드하는 메서드
 * @param {Object} file formidable 파일 객체
 * @param {String} folder S3 폴더명
 */
async function uploadOriginalObject(files, folder) {
  const uploads = files.map(file => {
    return s3
      .upload({
        Bucket: process.env.S3_BUCKET,
        Key: `${folder}/${file.file_id}`,
        Body: fs.createReadStream(file.path),
        ContentType: file.type,
      })
      .promise();
  });
  return Promise.all(uploads);
}

async function uploadResizeObject(files, folder) {
  const uploads = await files.reduce(async (acc, cur) => {
    let result = await acc;
    result.push(
      s3
        .upload({
          Bucket: process.env.S3_BUCKET,
          Key: `${folder}/resize/${cur.file_id}`,
          Body: await sharp(cur.path)
            .metadata()
            .then(({ width }) =>
              sharp(cur.path)
                .resize(Math.floor(width * 0.5))
                .toBuffer()
            ),
          ContentType: cur.type,
        })
        .promise()
    );
    return result;
  }, Promise.resolve([]));
  return Promise.all(uploads);
}

async function uploadS3Object(files, folder) {
  files = Array.isArray(files) ? files : [files];

  const uploads = [
    uploadOriginalObject(files, folder),
    RESIZE_FOLDER.includes(folder)
      ? uploadResizeObject(files, folder)
      : Promise.resolve(),
  ];

  return Promise.all(uploads);
}

/**
 * @description S3 파일을 삭제하는 메서드
 * @param {Array or String} deleteFileIds 삭제할 S3 fild_id
 * @param {string} targetFolder S3 폴더명
 */
async function deleteS3Object(deleteFileIds, targetFolder) {
  deleteFileIds =
    typeof deleteFileIds === 'string' ? [deleteFileIds] : deleteFileIds;
  const deletes = [];
  for (const fileId of deleteFileIds) {
    deletes.push(
      s3
        .deleteObject({
          Bucket: process.env.S3_BUCKET,
          Key: `${targetFolder}/${fileId}`,
        })
        .promise()
    );
    if (RESIZE_FOLDER.includes(targetFolder)) {
      deletes.push(
        s3
          .deleteObject({
            Bucket: process.env.S3_BUCKET,
            Key: `${targetFolder}/resize/${fileId}`,
          })
          .promise()
      );
    }
  }
  return Promise.all(deletes);
}

exports.s3 = s3;
exports.uploadS3Object = uploadS3Object;
exports.deleteS3Object = deleteS3Object;
