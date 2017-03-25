import React from 'react';
import { connect } from 'react-redux';
import Dropzone from 'react-dropzone';

class ImageField extends React.Component {
  onDrop(acceptedFiles, rejectedFiles) {
    console.log('Accepted files: ', acceptedFiles);
    console.log('Rejected files: ', rejectedFiles);
  }

  render() {
    return (
      <Dropzone onDrop={this.onDrop} />
    );
  }
}

export default connect()(ImageField);
