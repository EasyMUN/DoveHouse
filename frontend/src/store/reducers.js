import { combineReducers } from 'redux';

function token(state = null, action) {
  if(action.type === 'SET_TOKEN')
    return action.token;

  return state;
}

export default combineReducers({
  token,
});
