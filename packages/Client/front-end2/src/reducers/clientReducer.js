import { authConstants } from '../constants/constants';

export function client(state = {}, action) {
  switch (action.type) {
    case authConstants.TOKEN_REQUEST:
      return {
        ...state,
        action
      };
    case authConstants.TOKEN_SUCCESS:
      return {
        ...state,
        action
      };
    case authConstants.VALIDATE_TOKEN:
      return {
        ...state,
        action
      };
    case authConstants.TOKEN_FAILURE:
      return { 
        error: action.error
      };
   default:
      return state
  }
}