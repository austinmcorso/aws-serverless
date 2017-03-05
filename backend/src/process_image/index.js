const async = require('async');
const AWS = require('aws-sdk');
const gm = require('gm').subClass({ imageMagick: true });
const path = require('path');

const s3 = new AWS.S3();
const MAX_WIDTH = 100;
const MAX_HEIGHT = 100;
const PATHS = {
  ORIG: 'orig',
  SM: 'sm',
  MED: 'med',
  LG: 'lg',
};

// Download the image from S3 into a buffer.
function download(metaData, next) {
  s3.getObject({
    Bucket: metaData.srcBucket,
    Key: metaData.srcKey,
  }, (err, s3Object) => {
    if (err) {
      next(err.message);
      return;
    }

    console.log(`Image downloaded: ${metaData.srcKey}.`);
    next(null, metaData, s3Object);
  });
}

// Resize the image into a buffer.
function transform(metaData, s3Object, next) {
  gm(s3Object.Body).size((err, size) => {
    if (err) {
      next(err);
      return;
    }

    const scalingFactor = Math.min(
      MAX_WIDTH / size.width,
      MAX_HEIGHT / size.height
    );
    const width = scalingFactor * size.width;
    const height = scalingFactor * size.height;

    // Transform the image buffer in memory.
    gm(s3Object.Body).resize(width, height).toBuffer(metaData.imageType, (thisErr, buffer) => {
      console.log('Image resized.');
      if (thisErr) {
        next(thisErr);
        return;
      }

      next(null, metaData, s3Object.ContentType, buffer);
    });
  });
}

// Upload the image.
function upload(metaData, contentType, data, next) {
  const uploadKey = path.join('images', PATHS.SM, `${metaData.uuid}.${metaData.imageType}`);
  console.log(`Image upload started: ${metaData.srcBucket}:${uploadKey}`);
  s3.putObject({
    Bucket: metaData.srcBucket,
    Key: uploadKey,
    Body: data,
    ContentType: contentType,
    ACL: 'public-read',
  }, (err) => {
    if (err) {
      console.error(err);
      next(err.message);
      return;
    }

    console.log('Image upload complete.');
    next();
  });
}

function processImage(event, context, callback) {
  const done = (err, res) => callback(null, {
    statusCode: err ? '400' : '200',
    body: err ? err.message || err : JSON.stringify(res),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const src = event.Records[0].s3;
  const srcBucket = src.bucket.name;
  const srcKey = src.object.key;
  const uuid = path.parse(srcKey).name;

  // Infer the image type.
  const typeMatch = srcKey.match(/\.([^.]*)$/);
  if (!typeMatch) {
    done('Could not determine the image type.');
    return;
  }
  const imageType = typeMatch[1];
  if (imageType !== 'jpg' && imageType !== 'png') {
    done(`Unsupported image type: ${imageType}`);
    return;
  }
  const metaData = {
    imageType,
    srcBucket,
    srcKey,
    uuid,
  };

  // Download the image from S3, transform, and upload to a different S3 bucket.
  async.waterfall([
    next => next(null, metaData),
    download,
    transform,
    upload,
  ], (err) => {
    if (err) {
      done(`Unable to resize ${srcBucket}/${srcKey} and upload to ${srcBucket}/images/${uuid} due to an error: ${err}`);
      return;
    }

    done(null, `Successfully resized ${srcBucket}/${srcKey} and uploaded to ${srcBucket}/images/${uuid}`);
  });
}

module.exports = {
  download,
  transform,
  upload,
  processImage,
};
