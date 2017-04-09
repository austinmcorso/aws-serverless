const path = require('path');
const AWS = require('aws-sdk');
const uuid = require('uuid/v4');

const S3_BUCKET_NAME = 'mipmapper';
const S3_FOLDER_PREFIX = 'images';

function getValidationErrors() {
  return [];
}

module.exports = (event, context, done) => {
  const errors = getValidationErrors(event);
  if (errors.length > 0) {
    done(new Error(`[BadRequest] Validation errors: ${errors.join(',')}`));
  }

  const id = uuid();
  const filename = `${path.join(S3_FOLDER_PREFIX, 'orig', id)}.${event.imageType}`;
  const params = {
    Bucket: S3_BUCKET_NAME,
    Key: filename,
  };

  const s3 = new AWS.S3();
  s3.getSignedUrl(params, (err, url) => done(err, { id, url }));
};
