import * as ActionTypes from '../action_types';

const defaultState = {
  errors: [],
}

export default function errors(state = defaultState, action) {
  switch (action.type) {
    default:
      return state;
  }
}
