import {
  get as rawGet,
  post as rawPost,
} from '../util';

/* Unit actions */
export const setToken = token => ({
  type: 'SET_TOKEN',
  token,
});

export const setUser = user => ({
  type: 'SET_USER',
  user,
});

/* Basic networking */
export const get = (endpoint, method = 'GET', override = null) => async (dispatch, getStore) => {
  const { token } = getStore();
  return await rawGet(endpoint, override || token, method);
}

export const post = (endpoint, payload, method = 'POST', override = null) => async (dispatch, getStore) => {
  const { token } = getStore();
  return await rawPost(endpoint, payload, override || token, method);
}

/* Composed */
export const login = token => async dispatch => {
  const self = await dispatch(get('/login', 'GET', token));
  dispatch(setUser(self));
  dispatch(setToken(token));
}

export const refresh = () => async (dispatch, getStore) => {
  const { token } = getStore();
  const self = await dispatch(get('/login', 'GET', token));
  dispatch(setUser(self));
}

export const logout = () => dispatch => {
  dispatch(setUser(null));
  dispatch(setToken(null));
}
