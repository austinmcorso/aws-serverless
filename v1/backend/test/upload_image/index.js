/* eslint-env mocha */
/* eslint-disable import/no-extraneous-dependencies */

const fs = require('fs');
const assert = require('assert');
const proxyquire = require('proxyquire');

const file = fs.readFileSync('./test/data/test_image.jpg');
function s3Stub() {
  return {
    putObject: (obj, cb) => {
      fs.writeFileSync('./test/data/test_image_uploaded.jpg', obj.Body);
      return cb();
    },
  };
}

const fakeUuid = '123';

describe('Upload Image', () => {
  const awsStub = { S3: s3Stub };
  const uuid = () => fakeUuid;

  const upload = proxyquire('../../src/upload_image', {
    'aws-sdk': awsStub,
    'uuid/v4': uuid,
  });

  it('should upload image', (done) => {
    const event = {
      imageType: 'png',
      base64Image: file.toString('base64'),
    };

    upload(event, {}, (err, response) => {
      assert.equal(err, null);
      assert.deepEqual(response, { id: fakeUuid });
      assert.deepEqual(
        fs.readFileSync('./test/data/test_image_uploaded.jpg'),
        fs.readFileSync('./test/data/test_image.jpg')
      );
      done();
    });
  });
});
