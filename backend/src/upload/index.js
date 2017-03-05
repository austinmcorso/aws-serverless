const path = require('path');
const AWS = require('aws-sdk');
const uuid = require('uuid/v4');

const S3_BUCKET_NAME = 'mipmapper';
const S3_FOLDER_PREFIX = 'images';

function getValidationErrors() {
  // TODO: Make sure the image is a supported format
  // TODO: Make sure the image does exceed the maximum upload size
  return [];
}

function doUpload(imageType, imageContents, id, callback) {
  const s3 = new AWS.S3();
  const filename = `${path.join(S3_FOLDER_PREFIX, 'orig', id)}.${imageType}`;
  s3.putObject({
    Bucket: S3_BUCKET_NAME,
    Key: filename,
    Body: imageContents,
  }, callback);
}

module.exports = (event, context, callback) => {
  const errors = getValidationErrors(event);
  if (errors.length > 0) {
    callback(new Error(`[BadRequest] Validation errors: ${errors.join(',')}`));
  }

  const id = uuid();
  doUpload(event.imageType, new Buffer(event.base64Image, 'base64'), id, (err) => {
    if (err) {
      throw err;
    }

    callback(null, { id });
  });
};
