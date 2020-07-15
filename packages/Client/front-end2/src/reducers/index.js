import { combineReducers } from 'redux';
import { users } from './userReducer';
import { authentication} from './authenticationReducer';
import { client } from './clientReducer';
import { listitem } from './listReducer';
import {projects } from './projectReducer';

const rootReducer = combineReducers({
  users,
  authentication,
  client,
  listitem,
  projects
});

export default rootReducer;