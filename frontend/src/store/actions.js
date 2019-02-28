import {
  get as rawGet,
  post as rawPost,
} from '../util';

/* Unit actions */
export const login = user => ({
  type: 'LOGIN',
  user,
});

/* Basic networking */
export const get = (endpoint, method = 'GET') => async (dispatch, getStore) => {
  const { user } = getStore();
  return await rawGet(endpoint, user, method);
}

export const post = (endpoint, payload, method = 'POST') => async (dispatch, getStore) => {
  const { user } = getStore();
  return await rawPost(endpoint, payload, user, method);
}
