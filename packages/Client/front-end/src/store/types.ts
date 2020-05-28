/*export interface User{
    username: string
    password: string
}*/

export interface UserDataState{
    username: string
    password: string
}

export const SAVE_USER_DATA = 'SAVE_USER_DATA'

export const DELETE_USER_DATA = 'DELETE_USER_DATA'

interface SaveUserDataAction{
    type: typeof SAVE_USER_DATA,
    UserData: UserDataState
}

interface DeleteUserDataAction{
    type: typeof DELETE_USER_DATA,
    UserData: UserDataState
}
export type UserDataActionTypes = SaveUserDataAction | DeleteUserDataAction ;