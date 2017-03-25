import React from 'react';
import Dropzone from 'react-dropzone';

export default function ImageUpload({ onDrop }) {
  return (
    <Dropzone onDrop={onDrop} />
  );
}
