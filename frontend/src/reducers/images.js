import * as ActionTypes from '../action_types';

const defaultState = {
  images: [],
}

export default function images(state = defaultState, action) {
  switch (action.type) {
    case ActionTypes.ADD_IMAGE:
      return [action.image, ...state.images];
    default:
      return state;
  }
}
