import { clientConstants } from '../constants/constants';

export function client(state = {}, action) {
  switch (action.type) {
    case clientConstants.TOKEN_REQUEST:
      return {
        ...state,
        action
      };
    case clientConstants.TOKEN_SUCCESS:
      return {
        ...state,
        action
      };
    case clientConstants.VALIDATE_TOKEN:
      return {
        ...state,
        action
      };
    case clientConstants.TOKEN_FAILURE:
      return { 
        error: action.error
      };
   default:
      return state
  }
}