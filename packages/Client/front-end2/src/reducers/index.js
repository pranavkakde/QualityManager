import { combineReducers } from 'redux';
import { users } from './userReducer';
import { authentication} from './authenticationReducer';
import { client } from './clientReducer';
import { listitem } from './listReducer';

const rootReducer = combineReducers({
  users,
  authentication,
  client,
  listitem
});

export default rootReducer;