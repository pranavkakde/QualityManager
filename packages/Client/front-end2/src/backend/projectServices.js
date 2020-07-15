import config from 'config';
import {handleResponse} from './checkResponse';

export const projectServices = {    
    getProjects    
};

function getProjects(){    
    const requestOptions = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json'}
    };    
    return fetch(`${config.project_services_url}/projects`, requestOptions)
        .then(handleResponse)
        .then(response => {            
            return response;
        });
}
