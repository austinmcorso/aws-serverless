import { Observable } from 'rxjs';

import * as ActionTypes from '../action_types';
import actions from '../actions';

export default function imageUpload(action$) {
  return action$.ofType(ActionTypes.ADD_IMAGE)
    .map(action => action.image)
    .switchMap(image =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          let img = new Image;
          img.onload = () => resolve({
            image,
            width: img.width,
            height: img.height,
          });
          img.src = reader.result;
        };
        reader.readAsDataURL(image);
      })
    )
    .map(imageObj => actions.addImageSuccess(imageObj));
}
