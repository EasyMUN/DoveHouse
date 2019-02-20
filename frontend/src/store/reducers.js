import { combineReducers } from 'redux';

function user(state = null, action) {
  if(action.type === 'LOGIN')
    return action.user;

  return state;
}

export default combineReducers({
  user,
});
