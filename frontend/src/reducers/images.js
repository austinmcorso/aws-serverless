import * as ActionTypes from '../action_types';

const defaultState = {};

export default function images(state = defaultState, action) {
  switch (action.type) {
    case ActionTypes.ADD_IMAGE:
      return Object.assign({}, state, { orig: action.image });
    default:
      return state;
  }
}
