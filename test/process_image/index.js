/* eslint-env mocha */
/* eslint-disable import/no-extraneous-dependencies */

const fs = require('fs');
const assert = require('assert');
const proxyquire = require('proxyquire');
const sinon = require('sinon');

describe('Process Image', () => {
  const file = fs.readFileSync('./test/data/test_image.jpg');
  const awsStub = () => ({
    getObject: () => ({ Body: file }),
    putObject: () => {},
  });
  const { transform, processImage } = proxyquire('../../src/process_image', {
    'aws-sdk': awsStub,
  });

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
});
