import thunk from 'redux-thunk';
import logger from 'redux-logger';
import { applyMiddleware, createStore } from 'redux';
import reducers from './reducers';

const mws = applyMiddleware(
  thunk,
  logger,
);

const store = createStore(
  reducers,
  mws,
);

store.subscribe(() => {
  const { token } = store.getState();
  // Save to localstorage
  window.localStorage.setItem('token', token);
});

if(process.env.NODE_ENV !== 'production' && module.hot) {
  module.hot.accept('./reducers', () => store.replaceReducer(reducers));
}

export default store;
