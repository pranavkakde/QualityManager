import { combineReducers } from 'redux';
import { users } from './userReducer';
import { authentication} from './authenticationReducer';

const rootReducer = combineReducers({
  users,
  authentication
});

export default rootReducer;