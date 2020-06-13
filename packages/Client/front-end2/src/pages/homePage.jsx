import React from 'react';
import { connect } from 'react-redux';
import {PrimarySearchAppBar} from '../components/NavBar';
import { userActions } from '../actions';
import ListPanel from '../components/ListPanel';
import Grid from '@material-ui/core/Grid';
import { Paper } from "@material-ui/core";

class HomePage extends React.Component {
    componentDidMount() {
        //this.props.getUsers();
    }

    handleDeleteUser(id) {
        return (e) => this.props.deleteUser(id);
    }

    render() {
        const { user, users } = this.props;
        return (
            <div>
                <Grid container position="fixed">
                    <Grid item xs={12}>
                        <PrimarySearchAppBar {...this.props}/>
                    </Grid>
                    <Grid item xs="auto">
                        <ListPanel {...this.props}></ListPanel>
                    </Grid>
                    <Grid item xs="auto">
                        <Paper>
                            <p>
                                { this.props.item!=undefined?`${this.props.item.name} clicked`:''}
                            </p>
                        </Paper>
                    </Grid>
                </Grid>
            </div>
        );
    }
}

function mapState(state) {
    const { users, authentication } = state;
    const { item } = state.listitem;
    const { user } = authentication;
    return { user, users, item };
}

const actionCreators = {
    getUsers: userActions.getAll
}

const connectedHomePage = connect(mapState, actionCreators)(HomePage);
export { connectedHomePage as HomePage };