import React from 'react';
import { connect } from 'react-redux';

import ImageUpload from 'components/image_upload';
import Image from 'components/image';
import Loader from 'components/loader';
import actions from 'actions';
import '../index.scss';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.onDrop = this.onDrop.bind(this);
  }

  onDrop(acceptedFiles, rejectedFiles) {
    if (acceptedFiles.length) this.props.addImage(acceptedFiles[0]);
    if (rejectedFiles.length) this.props.displayError(rejectedFiles[0]);
  }

  render() {
    const { images } = this.props;
    const previewUrl = images.sm ? images.sm.url : '';
    const style = images.orig
      ? {
        background: `url(${images.orig.preview})`,
        height: images.orig.height,
        width: images.orig.width,
        fontSize: 0,
      }
      : {};

    return (
      <div>
        <h1>Mipmapper - Image Resizer</h1>
        <h5>Brought to you by lambda - <a href='https://github.com/austinmcorso/aws-serverless'>
          https://github.com/austinmcorso/aws-serverless
        </a></h5>
        {this.props.errors.length && <h5>{this.props.errors.message}</h5>}
        <div className={'images-container'}>
          <Image className={'upload'}>
            <ImageUpload
              onDrop={this.onDrop}
              style={style}
            />
          </Image>
          <Image className={'resized'}>
            {
              images.isLoading
                ? <Loader />
                : <a href={previewUrl}><img src={previewUrl} /></a>
            }
          </Image>
        </div>
      </div>
    );
  }
}

const mapStateToProps = ({images, errors}) => ({
  images,
  errors,
});

export default connect(mapStateToProps, actions)(App);
