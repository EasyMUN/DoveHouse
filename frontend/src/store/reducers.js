import { combineReducers } from 'redux';

import { Map } from 'immutable';

function token(state = null, action) {
  if(action.type === 'SET_TOKEN')
    return action.token;

  return state;
}

function user(state = null, action) {
  if(action.type === 'SET_USER')
    return action.user;

  return state;
}

function confs(state = null, action) {
  if(action.type === 'SET_CONFS')
    return action.confs;

  return state;
}

function payments(state = null, action) {
  if(action.type === 'SET_PAYMENTS')
    return action.payments;

  return state;
}

function assignments(state = null, action) {
  if(action.type === 'SET_ASSIGNMENTS')
    return action.assignments;

  return state;
}

function confCache(state = new Map(), { type, conf }) {
  if(type === 'CACHE_CONF')
    return state.set(conf._id, conf);

  return state;
}

function commsCache(state = new Map(), { type, id, comms }) {
  if(type === 'CACHE_COMMS')
    return state.set(id, comms);

  return state;
}

export default combineReducers({
  token,
  user,
  confs,
  payments,
  assignments,

  confCache,
  commsCache,
});
