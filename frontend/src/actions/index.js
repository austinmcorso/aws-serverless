import * as ActionTypes from '../action_types';

const addImage = {
  addImage: (image) => {
    return {
      type: ActionTypes.ADD_IMAGE,
      image,
    };
  },
  addImageSuccess: (image) => {
    return {
      type: ActionTypes.ADD_IMAGE_SUCCESS,
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

export default {
  ...addImage,
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
