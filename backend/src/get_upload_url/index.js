const path = require('path');
const AWS = require('aws-sdk');
const uuid = require('uuid/v4');

const S3_BUCKET_NAME = 'mipmapper';
const S3_FOLDER_PREFIX = 'images';
const ALLOWED_IMAGE_TYPES = ['jpg', 'png'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

function getValidationErrors(event) {
  const errors = [];
  if (ALLOWED_IMAGE_TYPES.indexOf(event.imageType) < 0) {
    errors.push('imageType must be png or jpg');
  }

  const fileSizeBytes = event.fileSizeBytes;
  if (!fileSizeBytes) {
    errors.push('fileSizeBytes must be specified');
  } else {
    const fileSizeBytesValue = parseInt(fileSizeBytes, 10);
    if (isNaN(fileSizeBytesValue) || fileSizeBytesValue < 0) {
      errors.push('fileSizeBytes must be a positive integer');
    } else if (fileSizeBytesValue > MAX_FILE_SIZE_BYTES) {
      errors.push('fileSizeBytes cannot exceed 5MB');
    }
  }

  return errors;
}

module.exports = (event, context, done) => {
  console.log(`Event: ${event}`);
  const errors = getValidationErrors(event);
  if (errors.length > 0) {
    done(new Error(`[BadRequest] Validation errors: ${errors.join(',')}`));
    return;
  }

  console.log('validation done');

  const id = uuid();
  const filename = `${path.join(S3_FOLDER_PREFIX, 'orig', id)}.${event.imageType}`;
  const params = {
    Bucket: S3_BUCKET_NAME,
    Key: filename,
    ContentLength: 3000,
  };

  console.log('params building done');
  const s3 = new AWS.S3();
  s3.getSignedUrl('putObject', params, (err, url) => {
    console.log('signed url done');
    done(err, { id, url });
  });
};
