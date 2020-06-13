import { withStyles, makeStyles, useTheme } from "@material-ui/core/styles";
import React, {Component} from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import AccountTreeIcon from '@material-ui/icons/AccountTree';
import BugReportIcon from '@material-ui/icons/BugReport';
import AssignmentIcon from '@material-ui/icons/Assignment';
import AssignmentTurnedInIcon from '@material-ui/icons/AssignmentTurnedIn';
import NewReleasesIcon from '@material-ui/icons/NewReleases';
import Drawer from '@material-ui/core/Drawer';
import {listActions} from '../actions/listActions';
import { connect } from 'react-redux';
import IconButton from '@material-ui/core/IconButton';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';

const drawerWidth = 240;
const useStyles = makeStyles((theme) => ({
  /*root: {
    width: '35%',
    height: '100%',    
    backgroundColor: theme.palette.background.paper,
  },*/root: {
    display: 'flex',
  },
  appBar: {
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: drawerWidth,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  hide: {
    display: 'none',
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: 'flex-end',
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: -drawerWidth,
  },
  contentShift: {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  }
}));

  
//class ListPanel extends Component {
function ListPanel(props) {
    /*constructor(props){
        super(props);
        this.state = {
            itemclicked: ""            
        };
        this.handleClick = this.handleClick.bind(this);
    }*/    
  //render() {
    
    //const { classes } = props;
    const classes = useStyles();
    const theme = useTheme();
    const handleClick=(event)=>{
      event.preventDefault();        
      const item ={
        name: event.target.firstChild.nodeValue
      }
      props.itemClicked(item);
      //this.setState({itemclicked: 'item clicked'});
    };

    const handleDrawerOpen = () => {
      props.setAppBarMenu(true);
    };
  
    const handleDrawerClose = (e) => {      
      e.preventDefault();
      console.log(props);
      props.setAppBarMenu(false);            
    };
    return (
        <div className={classes.root}>
        <Drawer
          variant="persistent"
          anchor="left"
          open={props.item!=undefined?props.item.open:true}
          >
          <div className={classes.drawerHeader}>
            <IconButton onClick={(e)=>handleDrawerClose(e)}>
              {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
            </IconButton>
          </div>
          <List component="nav" aria-label="main">
            <ListItem button name="project" onClick={(e)=>handleClick(e)} >
              <ListItemIcon>
                <AccountTreeIcon />
              </ListItemIcon>
              <ListItemText primary="Projects"  onClick={(e)=>handleClick(e)}/>
            </ListItem>
            <ListItem button  onClick={(e)=>handleClick(e)}>
              <ListItemIcon>
                <NewReleasesIcon />
              </ListItemIcon>
              <ListItemText primary="Releases" />
            </ListItem>
          </List>
          <Divider />
          <List component="nav" aria-label="secondary mailbox folders">
            <ListItem button onClick={(e)=>handleClick(e)}>
              <ListItemIcon>
                  <AssignmentIcon />
                </ListItemIcon>              
                <ListItemText primary="Test Suites" />
            </ListItem>
            <ListItem button onClick={(e)=>handleClick(e)} >
            <ListItemIcon>
                <AssignmentTurnedInIcon />
              </ListItemIcon>                 
              <ListItemText primary="Test Cases" />
            </ListItem>
            <Divider />
            <ListItem button onClick={(e)=>handleClick(e)} >
              <ListItemIcon>
                <BugReportIcon />
              </ListItemIcon>                 
              <ListItemText primary="Bug"  />
            </ListItem>          
          </List>
        </Drawer>
      </div>
    );
  //}
}

function mapState(state) {  
  const item = state.listitem;
  return { item };
}

const actionCreators = {
  itemClicked: listActions.itemSelect,
  setAppBarMenu: listActions.setAppBarMenu
}


//const testListPanel = withStyles(styles, { withTheme: true })(ListPanel);
/*const testList = connect(mapState, actionCreators)(ListPanel);
export { testList as ListPanel };*/

export default connect(mapState, actionCreators)(ListPanel);