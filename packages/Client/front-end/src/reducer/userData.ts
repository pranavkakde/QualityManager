import { SAVE_USER_DATA, DELETE_USER_DATA, UserDataActionTypes, UserDataState } from "../store/types";
const initState: UserDataState = {    
        username: '',
        password: ''
}
export const reducer_userData=(state: UserDataState = initState , action: UserDataActionTypes )=> {
    switch (action.type) {
        case SAVE_USER_DATA:            
            return {...action.UserData};
            break;
        case DELETE_USER_DATA:
            return null;        
        default:
            return state;
    }
}