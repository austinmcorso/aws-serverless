const async = require('async');
const AWS = require('aws-sdk');
const gm = require('gm').subClass({ imageMagick: true });
const path = require('path');

const MAX_WIDTH = 100;
const MAX_HEIGHT = 100;
const PATHS = {
  ORIG: 'ORIG',
  SM: 'SM',
  MED: 'MED',
  LG: 'LG',
};

const s3 = new AWS.S3();

module.exports = function processImage(event, context, callback) {
  const done = (err, res) => callback(null, {
    statusCode: err ? '400' : '200',
    body: err ? err.message : JSON.stringify(res),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const src = event.Records[0].s3;
  const srcBucket = src.bucket.name;
  const srcKey = src.object.key;
  const uuid = path.basename(srcKey);
  const dstKey = path.join(srcBucket, PATHS.SM, uuid);

  // Infer the image type.
  const typeMatch = srcKey.match(/\.([^.]*)$/);
  if (!typeMatch) {
    return done('Could not determine the image type.');
  }
  const imageType = typeMatch[1];
  if (imageType !== 'jpg' && imageType !== 'png') {
    return done(`Unsupported image type: ${imageType}`);
  }

  // Download the image from S3, transform, and upload to a different S3 bucket.
  async.waterfall([
    function download(next) {
      // Download the image from S3 into a buffer.
      s3.getObject({
        Bucket: srcBucket,
        Key: srcKey,
      },
      next);
    },
    function transform(response, next) {
      gm(response.Body).size((err, size) => {
        const scalingFactor = Math.min(
          MAX_WIDTH / size.width,
          MAX_HEIGHT / size.height
        );
        const width = scalingFactor * size.width;
        const height = scalingFactor * size.height;

        // Transform the image buffer in memory.
        gm(response.Body).resize(width, height).toBuffer(imageType, (thisErr, buffer) => {
          if (thisErr) {
            next(thisErr);
          } else {
            next(null, response.ContentType, buffer);
          }
        });
      });
    },
    function upload(contentType, data, next) {
      s3.putObject({
        Bucket: PATHS.SM,
        Key: dstKey,
        Body: data,
        ContentType: contentType,
      },
      next);
    },
  ], (err) => {
    if (err) {
      return done(`Unable to resize ${srcBucket}/${srcKey} and upload to ${srcBucket}/${dstKey} due to an error: ${err}`);
    }
    return done(null, `Successfully resized ${srcBucket}/${srcKey} and uploaded to ${srcBucket}/${dstKey}`);
  });
};
