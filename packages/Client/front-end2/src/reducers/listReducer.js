import { listConstants , tsConstants} from '../constants/constants';

export function listitem(state = {}, action) {
  switch (action.type) {
    case listConstants.ITEM_CLICKED:
      return {
        ...state,
        item: action.item
      };
    case listConstants.SET_APPBAR:
      return {
        ...state,
        open: action.open
      };
    case tsConstants.GETALL_TS_SUCCESS:
      return {
        ...state,
        ts: action.ts
      };      
    case tsConstants.GETALL_TS_FAILURE:
      return {
        ...state,
        err: action.err
      };        
      default:
      return state
  }
}