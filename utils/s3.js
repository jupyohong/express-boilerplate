const S3 = require('aws-sdk/clients/s3');
const fs = require('fs');
const sharp = require('sharp');

const { RESIZE_FOLDER, RESIZE_OPTION } = require('../config/config');
const CustomError = require('../config/CustomError');

const s3 = new S3({
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  region: process.env.BUCKET_REGION,
});

const uploadS3OriginalObject = async (files, folder) => {
  try {
    const uploads = files.map(file => {
      return s3
        .upload({
          Bucket: process.env.S3_BUCKET,
          Key: `${folder}/${file.fileId}`,
          Body: fs.createReadStream(file.path),
          ContentType: file.type,
        })
        .promise();
    });
    return Promise.all(uploads);
  } catch (error) {
    throw new CustomError(500, 'S3 원본 파일 업로드에 실패하였습니다.');
  }
};

const uploadS3ResizeObject = async (files, folder) => {
  try {
    const uploads = await files.reduce(async (acc, cur) => {
      const result = await acc;
      result.push(
        s3
          .upload({
            Bucket: process.env.S3_BUCKET,
            Key: `${folder}/resize/${cur.fileId}`,
            Body: await sharp(cur.path)
              .metadata()
              .then(({ width }) =>
                sharp(cur.path)
                  .resize(Math.floor(width * 0.5))
                  .withMetadata()
                  .toBuffer()
              ),
            ContentType: cur.type,
          })
          .promise()
      );
      for (const option of RESIZE_OPTION) {
        result.push(
          s3
            .putObject({
              Bucket: process.env.S3_BUCKET + '-resized',
              Key: `${option.name}/${folder}/${cur.fileId}`,
              Body: await sharp(cur.path)
                .resize({
                  width: option.width,
                  height: option.width,
                  fit: 'outside',
                })
                .toBuffer(),
              ContentType: cur.type,
            })
            .promise()
        );
      }
      return result;
    }, Promise.resolve([]));
    return Promise.all(uploads);
  } catch (error) {
    throw new CustomError(500, 'S3 리사이즈 파일 업로드에 실패하였습니다.');
  }
};

/**
 * @description S3에 원본과 리사이즈 모두 업로드하는 메서드
 * @param {Object} files formidable 파일 객체(배열)
 * @param {String} folder S3 폴더명
 */
const uploadS3Object = async (files, folder) => {
  try {
    files = Array.isArray(files) ? files : [files];
    const uploads = [
      uploadS3OriginalObject(files, folder),
      RESIZE_FOLDER.includes(folder)
        ? uploadS3ResizeObject(files, folder)
        : Promise.resolve(),
    ];
    return Promise.all(uploads);
  } catch (error) {
    throw new CustomError(500, 'S3 파일 업로드에 실패하였습니다.');
  }
};

/**
 * @description S3 파일을 삭제하는 메서드
 * @param {Array or String} deleteFileIds 삭제할 S3 fild_id
 * @param {string} targetFolder S3 폴더명
 */
const deleteS3Object = async (deleteFileIds, targetFolder) => {
  deleteFileIds = Array.isArray(deleteFileIds)
    ? deleteFileIds
    : [deleteFileIds];
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
    for (const option of RESIZE_OPTION) {
      deletes.push(
        s3
          .deleteObject({
            Bucket: process.env.S3_BUCKET + '-resized',
            Key: `${option.name}/${targetFolder}/${fileId}`,
          })
          .promise()
      );
    }
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
};

const createPresignedPost = key => {
  return new Promise((resolve, reject) => {
    s3.createPresignedPost(
      {
        Bucket: process.env.S3_BUCKET,
        Fields: {
          key,
        },
        Expires: 3,
        Conditions: [
          ['content-length-range', 0, 50 * 1000 * 1000],
          ['starts-with', '$Content-Type', 'image/'],
        ],
      },
      (err, url) => {
        if (err) reject(err);
        return resolve(url);
      }
    );
  });
};

const getSignedUrlOrig = key => {
  return new Promise((resolve, reject) => {
    s3.getSignedUrl(
      'getObject',
      {
        Bucket: process.env.S3_BUCKET,
        Key: key,
        Expires: 3,
      },
      (err, url) => {
        if (err) reject(err);
        return resolve(url);
      }
    );
  });
};

const getSignedUrlResized = (key, size) => {
  const found = RESIZE_OPTION.find(option => option.name === size);
  if (!found) {
    throw new CustomError(400, '리사이즈 옵션이 유효하지 않습니다.');
  }
  return new Promise((resolve, reject) => {
    s3.getSignedUrl(
      'getObject',
      {
        Bucket: process.env.S3_BUCKET + '-resized',
        Key: `${size}/${key}`,
        Expires: 3,
      },
      (err, url) => {
        if (err) reject(err);
        return resolve(url);
      }
    );
  });
};

module.exports = {
  s3,
  uploadS3OriginalObject,
  uploadS3ResizeObject,
  uploadS3Object,
  deleteS3Object,
  createPresignedPost,
  getSignedUrlOrig,
  getSignedUrlResized,
};
