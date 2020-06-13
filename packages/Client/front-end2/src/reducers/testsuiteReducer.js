import { tsConstants } from '../constants/constants';

export function tsActions(state = {}, action) {
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
      default:
      return state
  }
}