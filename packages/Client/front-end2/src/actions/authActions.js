import { clientConstants } from '../constants/constants';
import { history } from '../store/history';
import {clientServices} from '../backend/clientServices';

export const clientActions = {
    gettoken,
    validatetoken,
    removetoken    
};

function gettoken(username, password) {
    return dispatch => {        
        dispatch(request());                     
        clientServices.getToken(username, password)
            .then(
                token => { 
                    dispatch(success(token));
                    history.push('/home');
                },                
                error => {
                    dispatch(failure(error.toString()));
                    //dispatch(alertActions.error(error.toString()));
                }
            );        
    };
    function request(token) { return { type: clientConstants.TOKEN_REQUEST, token } }
    function success(token) { return { type: clientConstants.TOKEN_SUCCESS, token } }
    function failure(error) { return { type: clientConstants.TOKEN_FAILURE , error } }
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
}
function validatetoken() {
    return dispatch => {
        dispatch(request());        
        dispatch(success(users));
        /*services.validatetoken()
            .then(
                users => dispatch(success(users)),
                error => dispatch(failure(error.toString()))
            ); 
            */
    };

    function request() { return { type: userConstants.GETALL_REQUEST } }
    function success(users) { return { type: userConstants.GETALL_SUCCESS, users } }
    function failure(error) { return { type: userConstants.GETALL_FAILURE, error } }
}
