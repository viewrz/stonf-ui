import React from 'react';
import './App.css';
import Login from './Login';
import Confs from './Confs';
import Users from './Users';
import Nav from './Nav';
import { Switch, Route, Redirect } from 'react-router-dom';
import { getAuthToken } from './auth';

export default _ =>
  <div>
    <Switch>
      <Route exact path="/login">
        {getAuthToken() ? <Redirect to="/" /> : <Login />}
      </Route>
      {getAuthToken() ? null : <Redirect to="/login" />}
      <Redirect exact from="/" to="/confs" />
      <Route>
        <div>
          <Nav />
          <Route exact path="/confs" component={Confs} />
          <Route exact path="/users" component={Users} />
        </div>
      </Route>
    </Switch>
  </div>;
