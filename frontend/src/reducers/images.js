import * as ActionTypes from '../action_types';

const defaultState = {};

export default function images(state = defaultState, action) {
  switch (action.type) {
    case ActionTypes.ADD_IMAGE_SUCCESS:
      return Object.assign({}, state, { orig: {
        preview: action.image.preview,
        width: action.width,
        height: action.height,
      } });
    case ActionTypes.UPLOAD_IMAGE_SUCCESS:
      return Object.assign({}, state, { sm: {
        url: action.url,
      } });
    default:
      return state;
  }
}
