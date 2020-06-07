import React, { Component} from 'react'
import { connect } from 'react-redux';
import Button from '@material-ui/core/Button';
import { ValidatorForm, TextValidator } from 'react-material-ui-form-validator';
import { clientActions, userActions } from '../actions';

class LoginPage extends Component {    
    constructor(props){
        super(props);
        this.props.logout();
        this.state = {
            username: '',
            password: '',
            submitted: false
        }; 
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);       
    }
    handleChange(e){        
        const { name, value } = e.target;        
        this.setState({ [name]: value });
    }
    handleSubmit(event){
        const { username, password } = this.state;
        event.preventDefault();
        this.setState({ submitted: true, isvalidated:true});                
        if (username && password) {
            this.props.gettoken(username, password);
        }
    }
      
    render() {
        const { loggingIn } = this.props;
        const { username, password, submitted } = this.state;     
        return (
                <div>                    
                <ValidatorForm
                    ref="form"
                    onSubmit={(e)=>this.handleSubmit(e)}
                >
                    <h2>Login Form</h2>
                    <TextValidator
                        label="Username"
                        onChange={(e)=>this.handleChange(e)}
                        name="username"
                        value={username}                 
                        validators={['required']}
                        errorMessages={['Username field is required']}
                    />
                    <br />
                    <TextValidator
                        label="Password"
                        onChange={(e)=>this.handleChange(e)}
                        name="password"
                        type="password"
                        value={password}                  
                        validators={['required']}
                        errorMessages={['Password field is required']}
                    />
                    <br />
                    <br />
                    <Button
                        color="primary"
                        variant="contained"
                        type="submit"
                        disabled={submitted}
                    >Login                
                    </Button>
                </ValidatorForm>
                </div>
        )
    }
}
function mapState(state) {
    const { loggingIn } = state.authentication;
    return { loggingIn };
}

const actionCreators = {
    login: userActions.login,
    logout: userActions.logout,
    gettoken: clientActions.gettoken
};

const connectedLoginPage = connect(mapState, actionCreators)(LoginPage);
export { connectedLoginPage as LoginPage };