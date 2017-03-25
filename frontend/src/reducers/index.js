import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';

import images from 'reducers/images';
import errors from 'reducers/errors';

export default combineReducers({
  routing: routerReducer,
  images,
  errors,
});
