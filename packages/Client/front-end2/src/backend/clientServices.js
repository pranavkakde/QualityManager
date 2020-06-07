import config from 'config';
import {userServices} from './userServices';

export const clientServices = {    
    getToken,
    validateToken
};


function getToken(username,password){    
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify( {"username":  username , "password": password })
    };    
    return fetch(`${config.auth_services_url}/gettoken`, requestOptions)
        .then(handleResponse)
        .then(response => {            
            localStorage.setItem('token', JSON.stringify(response.token));
            return response.token;
        });
}

//function to validate existing token
function validateToken(token){
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify( {"token": token })
    };    
    return fetch(`${config.auth_services_url}/gettoken`, requestOptions)
        .then(handleResponse)
        .then(response => {            
            localStorage.setItem('token', JSON.stringify(response.token));
            return response.token;
        });
}

//function to get a refresh token - TBD
function refreshToken(){

}

function handleResponse(response) {
    return response.text().then(text => {
        const data = text && JSON.parse(text);
        if (!response.ok) {
            if (response.status === 401) {                
                location.reload(true);
            }
            const error = (data && data.message) || response.statusText;
            return Promise.reject(error);
        }
        return data;
    });
}