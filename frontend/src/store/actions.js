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

export const setConfs = confs => ({
  type: 'SET_CONFS',
  confs,
});

export const setPayments = payments => ({
  type: 'SET_PAYMENTS',
  payments,
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
  const [confs, payments] = await Promise.all([
    dispatch(get(`/user/${self._id}/conferences`, 'GET', token)),
    dispatch(get(`/user/${self._id}/payment?status=waiting`, 'GET', token)),
  ]);

  console.log(confs);

  dispatch(setUser(self));
  dispatch(setConfs(confs));
  dispatch(setPayments(payments));
  dispatch(setToken(token));
}

export const refresh = () => async (dispatch, getStore) => {
  const { token } = getStore();
  await dispatch(login(token));
}

export const logout = () => dispatch => {
  dispatch(setUser(null));
  dispatch(setToken(null));
}
