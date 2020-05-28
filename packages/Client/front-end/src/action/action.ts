import { SAVE_USER_DATA, DELETE_USER_DATA, UserDataActionTypes, UserDataState } from "../store/types";

export const saveUserData =(userData: UserDataState):UserDataActionTypes =>{
    return {
        type: SAVE_USER_DATA,
        UserData: userData
    }
}
export const deleteUserData=(userData: UserDataState):UserDataActionTypes=>{
    return {
        type: DELETE_USER_DATA,
        UserData: userData
    }
}