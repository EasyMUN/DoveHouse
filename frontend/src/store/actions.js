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

export const setAssignments = assignments => ({
  type: 'SET_ASSIGNMENTS',
  assignments,
});

export const cacheConf = conf => ({
  type: 'CACHE_CONF',
  conf,
});

export const cacheComms = (id, comms) => ({
  type: 'CACHE_COMMS',
  id,
  comms,
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
  const [confs, payments, assignments] = await Promise.all([
    dispatch(get(`/user/${self._id}/conferences`, 'GET', token)),
    dispatch(get(`/user/${self._id}/payment?status=waiting`, 'GET', token)),
    dispatch(get(`/user/${self._id}/assignment?submitted=false`, 'GET', token)),
  ]);

  dispatch(setUser(self));
  dispatch(setConfs(confs));
  dispatch(setPayments(payments));
  dispatch(setAssignments(assignments));
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

export const fetchConf = (id, allowCache = false) => async (dispatch, getStore) => {
  if(allowCache) {
    const { confCache } = getStore();

    if(confCache.has(id)) return confCache.get(id);
  }

  const conf = await dispatch(get(`/conference/${id}`));
  dispatch(cacheConf(conf));

  return conf;
};

export const fetchComms = (id, allowCache = false) => async (dispatch, getStore) => {
  if(allowCache) {
    const { commsCache } = getStore();

    if(commsCache.has(id)) return commsCache.get(id);
  }

  const conf = await dispatch(get(`/conference/${id}/committee`));
  dispatch(cacheComms(id, conf));

  return conf;
};
