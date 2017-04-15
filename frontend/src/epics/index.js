import { combineEpics } from 'redux-observable';

import imageAdd from 'epics/image_add';
import imageUpload from 'epics/image_upload';

export default combineEpics(imageAdd, imageUpload);
