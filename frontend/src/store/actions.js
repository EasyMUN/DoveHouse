import {
  get as rawGet,
  post as rawPost,
} from '../util';

/* Unit actions */
export const setToken = token => ({
  type: 'SET_TOKEN',
  token,
});

/* Basic networking */
export const get = (endpoint, method = 'GET') => async (dispatch, getStore) => {
  const { token } = getStore();
  return await rawGet(endpoint, token, method);
}

export const post = (endpoint, payload, method = 'POST') => async (dispatch, getStore) => {
  const { token } = getStore();
  return await rawPost(endpoint, payload, token, method);
}

/* Composed */
export const login = token => async dispatch => {
  // TODO: fetch user detail
  dispatch(setToken(token));
}
