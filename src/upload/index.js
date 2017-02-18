const path = require('path');
const AWS = require('aws-sdk');
const uuid = require('uuid/v4');

const S3_BUCKET_NAME = 'mipmapper';
const S3_FOLDER_PREFIX = 'uploads';
const jsonResponse = (statusCode, body) => ({
  statusCode,
  body: JSON.stringify(body),
  headers: {
    'Content-Type': 'application/json',
  },
});

function getValidationErrors(event) {
  // TODO: Make sure the image is a supported format
  // TODO: Make sure the image does exceed the maximum upload size
  return [];
}

function doUpload(imageType, imageContents, id, callback) {
  const s3 = new AWS.S3Client();
  const filename = `${path.join(S3_FOLDER_PREFIX, id)}.${imageType}`;
  s3.putObject({
    Bucket: S3_BUCKET_NAME,
    Key: path.join(S3_FOLDER_PREFIX, filename),
    Body: imageContents,
  }, callback);
}

module.exports = (event, context, callback) => {
  const errors = getValidationErrors(event);
  if (errors.length > 0) {
    callback(null, jsonResponse(400, { errors }));
  }

  const id = uuid();
  doUpload(event.payload.imageType, event.payload.base64Image, id, (err) => {
    if (err) {
      throw err;
    }

    jsonResponse(200, { id });
  });
};
