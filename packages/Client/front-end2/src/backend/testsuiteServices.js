import config from 'config';
import {handleResponse} from './checkResponse';
import {fetchOptions} from './authCommon';

export const tsServices = {
    getAllTSById,
    getAllTSByRelease
};

function getAllTSById() {
    const requestOptions = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }        
    };

    return fetch(`${config.ts_services_url}/6`, fetchOptions(requestOptions))
        .then(handleResponse)
        .then(testsuite => {
            return testsuite;
        });
}

function getAllTSByRelease(projectid) {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    };

    return fetch(`${config.user_services_url}/login`, requestOptions)
        .then(handleResponse)
        .then(user => {
            // store user details and jwt token in local storage to keep user logged in between page refreshes
            localStorage.setItem('user', JSON.stringify(username));

            return user;
        });
}
