/* eslint-env mocha */
/* eslint-disable import/no-extraneous-dependencies */

const assert = require('assert');
const proxyquire = require('proxyquire');

function s3Stub() {
  return {
    getSignedUrl: (op, params, cb) =>
      cb(null, `https://example.com/${params.Bucket}/${params.Key}`),
  };
}

const fakeUuid = '123';

describe('Upload Image', () => {
  const awsStub = { S3: s3Stub };
  const uuid = () => fakeUuid;

  const getUploadUrl = proxyquire('../../src/get_upload_url', {
    'aws-sdk': awsStub,
    'uuid/v4': uuid,
  });

  it('should upload image', (done) => {
    const event = { imageType: 'png', fileSizeBytes: 3 * 1024 * 1024 };

    getUploadUrl(event, {}, (err, response) => {
      assert.equal(err, null);
      assert.deepEqual(response, {
        id: fakeUuid,
        url: `https://example.com/mipmapper/images/orig/${fakeUuid}.png`,
      });
      done();
    });
  });

  it('fails when image type is invalid', (done) => {
    const event = { imageType: 'bmp', fileSizeBytes: 3 * 1024 * 1024 };

    getUploadUrl(event, {}, (err) => {
      assert.deepEqual(err.message, '[BadRequest] Validation errors: imageType must be png or jpg');
      done();
    });
  });

  [
    ['fails when fileSizeBytes is missing', null, 'fileSizeBytes must be specified'],
    ['fails when fileSizeBytes is not an integer', 'foo', 'fileSizeBytes must be a positive integer'],
    ['fails when fileSizeBytes is less than zero', -100, 'fileSizeBytes must be a positive integer'],
    ['fails when fileSizeBytes is greater than max allowed', 6 * 1024 * 1024, 'fileSizeBytes cannot exceed 5MB'],
  ].forEach(([testCase, value, expectedError]) => {
    it(testCase, (done) => {
      const event = { imageType: 'jpg', fileSizeBytes: value };

      getUploadUrl(event, {}, (err) => {
        assert.notEqual(null, err);
        assert.equal(err.message, `[BadRequest] Validation errors: ${expectedError}`);
        done();
      });
    });
  });
});
