import React, { Component } from 'react';
import PropTypes from 'prop-types';
import SwipeableViews from 'react-swipeable-views';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import { LoginPage } from "./loginPage";
import {clientActions, userActions} from '../actions';
//import {userActions} from '../actions/userActions';
import { connect } from 'react-redux';

function TabPanel(props) {
    const { children, value, index, ...other } = props;
  
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`full-width-tabpanel-${index}`}
        aria-labelledby={`full-width-tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box p={2}>
            <div>{children}</div>
          </Box>
        )}
      </div>
    );
  }
  
  TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.any.isRequired,
    value: PropTypes.any.isRequired,
  };

  
class LandingPage extends Component {
    
    constructor(props){
        super(props); 
        this.props.logout();        
        this.state = {            
            value: 0            
        };
        this.handleChange=this.handleChange.bind(this)
        this.handleChangeIndex=this.handleChangeIndex.bind(this)
    }    
    handleChange(event, newValue){
        this.setState({value: newValue});
    };
    handleChangeIndex (index) {
      this.setState({value: index});
    };
    render() {                

        function a11yProps(index) {
            return {
                id: `full-width-tab-${index}`,
                'aria-controls': `full-width-tabpanel-${index}`,
            };
        }  
        return (
            <div >
            <AppBar position="static" color="default">
                <Tabs
                value={this.state.value}
                onChange={(e,v)=>this.handleChange(e,v)}
                indicatorColor="primary"
                textColor="primary"
                variant="fullWidth"
                aria-label="full width tabs example"
                >
                <Tab label="Login" {...a11yProps(0)} />
                <Tab label="Sign Up" {...a11yProps(1)} />                
                </Tabs>
            </AppBar>
            <SwipeableViews
                //axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
                index={this.state.value}
                onChangeIndex={this.handleChangeIndex}
            >
                <TabPanel value={this.state.value} index={0}>
                <LoginPage />
                </TabPanel>
                <TabPanel value={this.state.value} index={1}>
                Register
                </TabPanel>
            </SwipeableViews>
            </div>
        )
    }
}

function mapState(state) {
  const { loggingIn } = state.authentication;
  return { loggingIn };
}

const actionCreators = {
  logout: userActions.logout,
  gettoken: clientActions.gettoken,
  validatetoken: clientActions.validatetoken,
  removetoken: clientActions.removetoken
};

//const conLandingPage = connect(mapState, actionCreators)(LandingPage);
export default connect(mapState, actionCreators)(LandingPage);
//export { conLandingPage as LandingPage};
