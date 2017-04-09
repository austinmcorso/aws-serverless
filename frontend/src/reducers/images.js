import * as ActionTypes from '../action_types';

const defaultState = {};

export default function images(state = defaultState, action) {
  switch (action.type) {
    case ActionTypes.ADD_IMAGE:
      return Object.assign({}, state, { orig: action.image });
    case ActionTypes.ADD_IMAGE_SUCCESS:
      return Object.assign({}, state, { id: action.id });
    default:
      return state;
  }
}
