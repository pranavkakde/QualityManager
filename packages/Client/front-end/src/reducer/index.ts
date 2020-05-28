import { reducer_userData } from "./userData";
import { combineReducers } from "redux";

export const allReducers = combineReducers({
    userData: reducer_userData
})

export type RootState = ReturnType<typeof allReducers>