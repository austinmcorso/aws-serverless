import { Observable } from 'rxjs';
import { ajax } from 'rxjs/observable/dom/ajax';

import * as ActionTypes from '../action_types';
import actions from '../actions';
import { receiveUserRepos } from '../actions';
import config from '../config';

export default function imageUpload(action$) {
  return action$.ofType(ActionTypes.ADD_IMAGE)
    .map(action => action.image.preview)
    .switchMap(image =>
        ajax.post(`${config.apiUrl}/images`, image)
          .map(() => actions.addImageSuccess())
          .catch(err => Observable.of(actions.addImageFail(err)))
    );
}
