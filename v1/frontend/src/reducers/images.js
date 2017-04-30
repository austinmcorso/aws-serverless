import * as ActionTypes from '../action_types';

const defaultState = {
  isLoading: false,
};

export default function images(state = defaultState, action) {
  switch (action.type) {
    case ActionTypes.ADD_IMAGE_SUCCESS:
      return Object.assign({}, state, {
        orig: {
          preview: action.image.preview,
          width: action.width,
          height: action.height,
        },
        isLoading: true,
        sm: null,
      });
    case ActionTypes.UPLOAD_IMAGE_SUCCESS:
      return Object.assign({}, state, {
        sm: {
          url: action.url,
        },
        isLoading: false,
      });
    case ActionTypes.UPLOAD_IMAGE_FAIL:
      return Object.assign({}, state, {
        isLoading: false,
      });
    default:
      return state;
  }
}
