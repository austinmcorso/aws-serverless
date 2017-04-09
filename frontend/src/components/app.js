import React from 'react';
import { connect } from 'react-redux';

import ImageUpload from 'components/image_upload';
import Image from 'components/image';

import actions from 'actions';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.onDrop = this.onDrop.bind(this);
  }

  onDrop(acceptedFiles, rejectedFiles) {
    console.log(acceptedFiles, rejectedFiles);
    if (acceptedFiles.length) this.props.addImage(acceptedFiles[0]);
    if (rejectedFiles.length) this.props.displayError(rejectedFiles[0]);
  }

  render() {
    console.log(this.props);
    return (
      <div>
        <h1>Mipmapper</h1>
        {this.props.errors.length && <h5>{this.props.errors.message}</h5>}
        <Image>
          <ImageUpload onDrop={this.onDrop} />
          <img src={this.props.images.orig ? this.props.images.orig.preview : ''} />
        </Image>
        <Image>
          <img src='' />
        </Image>
      </div>
    );
  }
}

const mapStateToProps = ({images, errors}) => ({
  images,
  errors,
});

export default connect(mapStateToProps, actions)(App);
