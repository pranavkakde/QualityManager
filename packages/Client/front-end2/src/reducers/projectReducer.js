import { projectConstants } from '../constants/constants';

export function projects(state = {}, action) {
  switch (action.type) {
    case projectConstants.GETALL_PROJ_FAILURE:
      return {
        ...state,
        error: action.error
      };
    case projectConstants.GETALL_PROJ_SUCCESS:
      return {
        ...state,
        projectList: action.projectData
      };
    default:
      return {
        ...state,
        projectList: []
      }
  }
}