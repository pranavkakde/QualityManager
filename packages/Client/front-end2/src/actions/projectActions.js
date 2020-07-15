import { projectConstants } from '../constants/constants';
import {projectServices} from '../backend';

export const projectActions = {
    getProjects    
};

function getProjects() {
    return dispatch => {                             
        projectServices.getProjects()
            .then(
                projectData => { 
                    dispatch(success(projectData));
                },                
                error => {
                    dispatch(failure(error.toString()));
                }
            );
    };    
    function success(projectData) { return { type: projectConstants.GETALL_PROJ_SUCCESS, projectData } }
    function failure(error) { return { type: projectConstants.GETALL_PROJ_FAILURE , error } }
}