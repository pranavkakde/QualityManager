import React, { Component} from 'react'
import { connect } from 'react-redux';
import Button from '@material-ui/core/Button';
import { ValidatorForm, TextValidator, SelectValidator  } from 'react-material-ui-form-validator';
import { authActions, projectActions } from '../actions';
import MenuItem from '@material-ui/core/MenuItem';
class LoginPage extends Component {    
    constructor(props){
        super(props);
        this.props.logout();
        this.props.getProjects();
        this.state = {
            username: '',
            password: '',
            submitted: false,
            projectid: 0,
            age: ''
        }; 
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);       
        console.log(this.props.projectList[0].ProjectId) //fix this
    }
    handleChange(e){        
        const { name, value } = e.target;        
        this.setState({ [name]: value });
    }
    handleSubmit(event){
        const { username, password, projectid } = this.state;
        event.preventDefault();
        this.setState({ submitted: true, isvalidated:true});                
        if (username && password && projectid) {
            this.props.login(username, password, projectid);
        }
    }
    handleSelect(event){
        //const projectList=this.props.projectList;
        const { name, value } = event.target;
        console.log(name)
        console.log(value)
        event.preventDefault();
        //this.setState({projectid: }) 
    }
    componentDidMount() {
        //this.props.getProjects();
        //console.log(this.props.projectList)        
    }

    render() {
        //const { loggingIn } = this.props;
        const { username, password, submitted, projectid } = this.state;
        const {projectList} = this.props.projectList;
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
                    <SelectValidator
                        label="Project List"
                        onChange={(e)=>this.handleChange(e)}
                        name="projectlist"                              
                        validators={['required']}
                        errorMessages={['Project List field is required']}
                        SelectProps={{
                            multiple: false,
                            value: ['one', 'tow']
                          }}                          
                    >
                        <MenuItem>1</MenuItem>
                          <MenuItem>2</MenuItem>
                    </SelectValidator>
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
    const { projectList } = state.projects.projectList;
    return { loggingIn,projectList};
}

const actionCreators = {    
    logout: authActions.removetoken,
    login: authActions.gettoken,
    getProjects: projectActions.getProjects
};

const connectedLoginPage = connect(mapState, actionCreators)(LoginPage);
export { connectedLoginPage as LoginPage };