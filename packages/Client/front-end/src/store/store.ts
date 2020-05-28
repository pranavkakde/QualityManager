import { createStore,  applyMiddleware} from "redux";
import { allReducers } from "../reducer";
import { composeWithDevTools } from 'redux-devtools-extension';
export const store = createStore(
    allReducers ,  composeWithDevTools(
        applyMiddleware(),
        // other store enhancers if any
      )
    );