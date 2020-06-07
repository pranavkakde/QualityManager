import { combineReducers } from 'redux';
import { users } from './userReducer';
import { authentication} from './authenticationReducer';
import { client } from './clientReducer';

const rootReducer = combineReducers({
  users,
  authentication,
  client
});

export default rootReducer;