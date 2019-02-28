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

export default combineReducers({
  token,
  user,
});
