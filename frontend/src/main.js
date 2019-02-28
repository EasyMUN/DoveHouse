import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

import store from './store/index.js';
import { StoreContext } from 'redux-react-hook';

import { Router, Route } from './Router';

import blueGrey from '@material-ui/core/colors/blueGrey';
import blue from '@material-ui/core/colors/blue';
import { createMuiTheme } from '@material-ui/core/styles';
import { ThemeProvider } from '@material-ui/styles';

const root = document.getElementById('root');

const theme = createMuiTheme({
  palette: {
    primary: {
      main: blueGrey[600],
    },
    secondary: {
      main: blue[500],
    },
  },
});

async function render(Comp) {
  return ReactDOM.render(
    <StoreContext.Provider value={store}>
      <ThemeProvider theme={theme}>
        <Router>
          <Comp />
        </Router>
      </ThemeProvider>
    </StoreContext.Provider>,
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
