const {} = require('./common.service');
const { getSignedUrlResized, getSignedUrlOrig } = require('../../utils/s3');

const getS3PresignedUrl = async (req, res) => {
  const { folder, fileId } = req.params;

  const presignedData = {
    signedUrl: null,
  };
  presignedData.signedUrl = await getSignedUrlOrig(`${folder}/${fileId}`);

  if (RESIZE_FOLDER.includes(folder)) {
    // TODO: 폴더별 리사이즈 조건 추가(예: profile이면 w100으로만 리사이즈)
    presignedData.signedUrlW250 = await getSignedUrlResized(
      `${folder}/${fileId}`,
      'w250'
    );
    presignedData.signedUrlW500 = await getSignedUrlResized(
      `${folder}/${fileId}`,
      'w500'
    );
  }

  return res.status(200).json(presignedData);
};

module.exports = {
  getS3PresignedUrl,
};
