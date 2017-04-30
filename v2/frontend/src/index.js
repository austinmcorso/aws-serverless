/*
  redux-observable does not automatically add every RxJS operator to
  the Observable prototype. Because there are many ways to add them,
  our examples will not include any imports. If you want to add every
  operator, put import 'rxjs'; in your entry index.js.

  More info: https://github.com/ReactiveX/rxjs#installation-and-usage
 */

import 'rxjs';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { Router, Route, browserHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import configureStore from './configure_store';
import App from 'components/app';

const store = configureStore();
const history = syncHistoryWithStore(
  browserHistory,
  store
);

ReactDOM.render(
  <Provider store={store}>
    <Router history={history}>
      <Route path="*" component={App} />
    </Router>
  </Provider>,
  document.querySelector('.app')
);
