const processImage = require('./process_image').processImage;
const upload = require('./upload_image');
const getUploadUrl = require('./get_upload_url');

module.exports = {
  processImage,
  getUploadUrl,
  upload,
};
