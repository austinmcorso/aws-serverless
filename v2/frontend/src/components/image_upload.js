import React from 'react';
import Dropzone from 'react-dropzone';

export default function ImageUpload({ onDrop, style }) {
  return (
    <Dropzone
      onDrop={onDrop}
      multiple={false}
      maxSize={1*1024*1024}
      accept={'image/*'}
      style={style}
    >
      Drag an image or click to upload
    </Dropzone>
  );
}
