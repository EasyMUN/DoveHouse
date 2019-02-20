import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

import store from './store/index.js';
import { Provider } from 'react-redux';

import { BrowserRouter } from 'react-router-dom';

const root = document.getElementById('root');

async function render(Comp) {
  return ReactDOM.render(
    <Provider store={store}>
      <BrowserRouter>
        <Comp />
      </BrowserRouter>
    </Provider>,
    root
  );
}

render(App);

if(module.hot) {
  module.hot.accept('./App', () => {
    const NextApp = require('./App').default;

    render(NextApp);
  });
}

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
