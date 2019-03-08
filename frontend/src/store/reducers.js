import { combineReducers } from 'redux';

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

export default combineReducers({
  token,
  user,
  confs,
  payments,
});
