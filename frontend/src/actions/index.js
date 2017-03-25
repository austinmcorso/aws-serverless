import * as ActionTypes from '../action_types';

export default {
  addImage: (image) => {
    return {
      type: ActionTypes.ADD_IMAGE,
      image,
    };
  },
  displayError: (error) => {
    return {
      type: ActionTypes.DISPLAY_ERROR,
      error,
    };
  },
  uploadImage: () => {
    return {
      type: ActionTypes.UPLOAD_IMAGE,
    };
  },
}
