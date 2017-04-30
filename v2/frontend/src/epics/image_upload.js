import { Observable } from 'rxjs';
import { ajax } from 'rxjs/observable/dom/ajax';

import * as ActionTypes from '../action_types';
import actions from '../actions';
import config from '../config';

export default function imageUpload(action$) {
  return action$.ofType(ActionTypes.ADD_IMAGE_SUCCESS)
    .map(action => action.image)
    .switchMap(image =>
      ajax({
        method: 'POST',
        url: `${config.apiUrl}/images`,
        body: image,
        headers: {
          'Content-Type': 'image/png',
        },
        responseType: 'json',
        crossDomain: true,
      })
    )
    .map(res => res.response.id)
    .switchMap(id =>
      ajax({
        method: 'GET',
        url: `${config.s3Url}/images/sm/${id}.png`,
        crossDomain: true,
      })
      .retryWhen(errors => {
        return errors
          .scan((retryCount, err) => {
            if (err.status === 404 && retryCount < config.maxLoadingSeconds) return retryCount + 1;
            throw err;
          }, 0)
          .delay(1000);
      })
    )
    .map(res => actions.uploadImageSuccess(res.request.url))
    .catch(err => {
      return Observable.of(actions.uploadImageFail(err));
    });
}
