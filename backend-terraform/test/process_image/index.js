/* eslint-env mocha */
/* eslint-disable import/no-extraneous-dependencies */

const fs = require('fs');
const assert = require('assert');
const proxyquire = require('proxyquire');

const file = fs.readFileSync('./test/data/test_image.jpg');
function s3Stub() {
  return {
    getObject: (obj, cb) => cb(null, { Body: file }),
    putObject: (obj, cb) => {
      fs.writeFileSync('./test/data/test_image_resized.jpg', obj.Body);
      return cb();
    },
  };
}

describe('Process Image', () => {
  const awsStub = { S3: s3Stub };
  const handler = proxyquire('../../src/process_image', {
    'aws-sdk': awsStub,
  });

  const processImage = handler.processImage;
  const transform = handler.transform;

  it('should transform image', (done) => {
    const metaData = {
      imageType: 'jpg',
      srcBucket: 'bucket',
      srcKey: 'key',
    };
    const s3Object = {
      Body: file,
      ContentType: 'image/jpeg',
    };
    transform(metaData, s3Object, (err, m, s, b) => {
      assert.strictEqual(err, null);
      assert.strictEqual(b instanceof Buffer, true);
      done();
    });
  });

  it('should process image', (done) => {
    const event = {
      Records: [{
        s3: {
          bucket: { name: 'bucket' },
          object: { key: 'test_image.jpg' },
        },
      }],
    };
    processImage(event, null, (err, res) => {
      assert.strictEqual(err, null);
      assert.strictEqual(res.statusCode, '200');
      done();
    });
  });
});
