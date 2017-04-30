import * as ActionTypes from '../action_types';

const defaultState = {};

export default function errors(state = defaultState, action) {
  switch (action.type) {
    case ActionTypes.DISPLAY_ERROR:
      return Object.assign({}, state, { message: action.message });
    default:
      return state;
  }
}
