import * as ActionTypes from '../action_types';

const addImage = {
  addImage: (image) => {
    return {
      type: ActionTypes.ADD_IMAGE,
      image,
    };
  },
  addImageSuccess: ({ image, height, width }) => {
    return {
      type: ActionTypes.ADD_IMAGE_SUCCESS,
      image,
      height,
      width,
    };
  },
  addImageFail: (error) => {
    return {
      type: ActionTypes.ADD_IMAGE_FAIL,
      message: error.message,
      status: error.status,
    };
  },
};

const uploadImage = {
  uploadImage: (image) => {
    return {
      type: ActionTypes.UPLOAD_IMAGE,
      image,
    };
  },
  uploadImageSuccess: (url) => {
    return {
      type: ActionTypes.UPLOAD_IMAGE_SUCCESS,
      url,
    };
  },
  uploadImageFail: (error) => {
    return {
      type: ActionTypes.UPLOAD_IMAGE_FAIL,
      message: error.message,
      status: error.status,
    };
  },
};

export default {
  ...addImage,
  ...uploadImage,
  displayError: (message) => {
    return {
      type: ActionTypes.DISPLAY_ERROR,
      message,
    };
  },
  uploadImage: () => {
    return {
      type: ActionTypes.UPLOAD_IMAGE,
    };
  },
}
