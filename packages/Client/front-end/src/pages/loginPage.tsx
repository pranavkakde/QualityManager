import React, { Component } from 'react'
import {  } from "redux";
import { store } from '../store/store';
import { saveUserData } from '../action/action';
import {useSelector} from 'react-redux';
import { RootState } from "../reducer";

export default class LoginPage extends Component {
    
    render() {   
        //const user = useSelector((state: RootState) => state.userData);    
    const handleClick=() =>{
        //store.dispatch(saveUserData({username:'test', password:'test'}))
        //console.log(`${user}`)
        console.log('here')
        store.subscribe(()=> console.log(store.getState()));
    }     
        return (
            <div>
                <p>This is a login page</p>
                <form onClick={handleClick}>
                    <input type="text" placeholder="Enter a user name"/><br/>
                    <input type="password" placeholder="Enter password"/><br/>
                    <button id="login" onClick={()=> store.dispatch(saveUserData({username:'test', password:'test'}))}>Login</button>
                    </form>
            </div>
        )
    }
}

