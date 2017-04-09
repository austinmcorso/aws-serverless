import { combineEpics } from 'redux-observable';

import imageUpload from 'epics/image_upload';

export default combineEpics(imageUpload);
