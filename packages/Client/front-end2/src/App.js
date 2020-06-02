import React from 'react';
import { Router, Route, Switch, Redirect } from 'react-router-dom';
import { history } from './store/history';
import { PrivateRoute } from './components/PrivateRoute';
import { HomePage } from './pages/homePage';
import { LoginPage } from './pages/loginPage';
import LandingPage  from './pages/landingPage';

export default class App extends React.Component {
    constructor(props) {
        super(props);

    }

    render() {
        const { alert } = this.props;
        return (
            <div>
              <div>
                  <Router history={history}>
                      <Switch>
                          <PrivateRoute exact path="/home" component={HomePage} />
                          <Route exact path="/login" component={LandingPage} />                          
                          <Redirect from="*" to="/" />
                      </Switch>
                  </Router>
              </div>
            </div>
        );
    }
}