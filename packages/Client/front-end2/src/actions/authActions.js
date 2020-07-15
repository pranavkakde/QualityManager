import { authConstants } from '../constants/constants';
import { history } from '../store/history';
import {authServices} from '../backend/authServices';

export const authActions = {
    gettoken,
    validatetoken,
    removetoken    
};

function gettoken(username, password) {
    return dispatch => {        
        dispatch(request());                     
        authServices.getToken(username, password)
            .then(
                token => { 
                    dispatch(success(token));
                    history.push('/home');
                },                
                error => {
                    dispatch(failure(error.toString()));
                }
            );
    };
    function request(token) { return { type: authConstants.TOKEN_REQUEST, token } }
    function success(token) { return { type: authConstants.TOKEN_SUCCESS, token } }
    function failure(error) { return { type: authConstants.TOKEN_FAILURE , error } }
}

/*function register(user) {
    return dispatch => {
        dispatch(request(user));

        userService.register(user)
            .then(
                user => { 
                    dispatch(success());
                    history.push('/login');
                    dispatch(alertActions.success('Registration successful'));
                },
                error => {
                    dispatch(failure(error.toString()));
                    dispatch(alertActions.error(error.toString()));
                }
            );
    };

    function request(user) { return { type: userConstants.REGISTER_REQUEST, user } }
    function success(user) { return { type: userConstants.REGISTER_SUCCESS, user } }
    function failure(error) { return { type: userConstants.REGISTER_FAILURE, error } }
}
*/
function removetoken() {
    localStorage.removeItem('token');
    history.push('/');
    return { type: authConstants.TOKEN_REMOVED };
}
function validatetoken(token) {
    return dispatch => {
        dispatch(request());        
        dispatch(success(token));
        authServices.validatetoken(token)
            .then(
                token => dispatch(success(token)),
                error => dispatch(failure(error.toString()))
            );            
    };

    function request(token) { return { type: authConstants.TOKEN_REQUEST, token } }
    function success(token) { return { type: authConstants.TOKEN_SUCCESS, token } }
    function failure(error) { return { type: authConstants.TOKEN_FAILURE , error } }
}
