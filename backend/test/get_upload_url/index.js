/* eslint-env mocha */
/* eslint-disable import/no-extraneous-dependencies */

const assert = require('assert');
const proxyquire = require('proxyquire');

function s3Stub() {
  return {
    getSignedUrl: (params, cb) =>
      cb(null, `https://example.com/${params.Bucket}/${params.Key}`),
  };
}

const fakeUuid = '123';

describe('Upload Image', () => {
  const awsStub = { S3: s3Stub };
  const uuid = () => fakeUuid;

  const upload = proxyquire('../../src/get_upload_url', {
    'aws-sdk': awsStub,
    'uuid/v4': uuid,
  });

  it('should upload image', (done) => {
    const event = { imageType: 'png' };

    upload(event, {}, (err, response) => {
      assert.equal(err, null);
      assert.deepEqual(response, {
        id: fakeUuid,
        url: `https://example.com/mipmapper/images/orig/${fakeUuid}.png`,
      });
      done();
    });
  });
});
