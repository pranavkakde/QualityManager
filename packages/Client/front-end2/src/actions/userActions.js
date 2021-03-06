import { userConstants } from '../constants/constants';
import { history } from '../store/history';
import { userServices } from '../backend/userServices';

export const userActions = {
    login,
    logout,
    getAll
};

function login(username, password) {    
    return dispatch => {        
        dispatch(request({ username }));
        dispatch(success(username));                
        userServices.login(username, password)        
            .then(
                user => { 
                    //localStorage.setItem('user', JSON.stringify(username));    
                    dispatch(success(user));
                    history.push('/home');
                },                
                error => {
                    dispatch(failure(error.toString()));
                    //dispatch(alertActions.error(error.toString()));
                }
            );        
    };
    function request(user) { return { type: userConstants.LOGIN_REQUEST, user } }
    function success(user) { return { type: userConstants.LOGIN_SUCCESS, user } }
    function failure(error) { return { type: userConstants.LOGIN_FAILURE, error } }
}

function logout() {
    userServices.logout();
    history.push('/');
    return { type: userConstants.LOGOUT };
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
function getAll() {
    return dispatch => {
        dispatch(request());
        
        let users = {
            user:{
                firstName: 'test',
                username: 'test'
    
            }            
        }
        dispatch(success(users));
        /* userService.getAll()
            .then(
                users => dispatch(success(users)),
                error => dispatch(failure(error.toString()))
            ); */
    };

    function request() { return { type: userConstants.GETALL_REQUEST } }
    function success(users) { return { type: userConstants.GETALL_SUCCESS, users } }
    function failure(error) { return { type: userConstants.GETALL_FAILURE, error } }
}
