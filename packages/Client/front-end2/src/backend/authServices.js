import config from 'config';
import {handleResponse} from './checkResponse';

export const authServices = {    
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
    return fetch(`${config.auth_services_url}/validatetoken`, requestOptions)
        .then(handleResponse)
        .then(response => {
            console.log(response);
            return response.contains('success')?response:null;             
        });
}

//function to get a refresh token - TBD
function refreshToken(){

}

