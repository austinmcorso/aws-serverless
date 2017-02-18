'use strict';

var path = require('path');
var AWS = require('aws-sdk');
var uuid = require('uuid/v4');

const S3_BUCKET_NAME = 'mipmapper';
const S3_FOLDER_PREFIX = 'uploads';
const jsonResponse = (statusCode, body) => ({
  statusCode: statusCode,
  body: JSON.stringify(body),
  headers: 'Content-Type': 'application/json'
});

function getValidationErrors(event) {
  // TODO: Make sure the image is a supported format
  // TODO: Make sure the image does exceed the maximum upload size
  return [];
}

function doUpload(contents, id, callback) {
  const s3 = new AWS.S3Client();
  var filename = path.join(S3_FOLDER_PREFIX, id) + path.extension()
  s3.putObject({ Bucket: S3_BUCKET_NAME, Key: path.join(S3_FOLDER_PREFIX, filename), Body: contents }, callback);
}

module.exports = (event, context, callback) => {
    const errors = getValidationErrors(event);
    if (errors.length > 0) {
      callback(null, jsonResponse(400, { errors: errors }));
    }

    const id = uuid();
    doUpload(event.payload, id, () => jsonResponse(200, { id: id }));
};
