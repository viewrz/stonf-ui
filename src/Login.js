import React, { Component } from 'react';
import { setAuthToken } from './auth';
import { withRouter } from 'react-router-dom';
import { graphql, gql, compose } from 'react-apollo';

const query = gql`
  mutation($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      token
    }
  }
`;

class Login extends Component {
  state = { username: '', password: '', error: '', loading: false };
  change = (key, e) => this.setState({ [key]: e.target.value, error: '' });

  submit = async e => {
    e.preventDefault();
    this.setState({ loading: true });
    try {
      setAuthToken(
        (await this.props.mutate({ variables: this.state })).data.login.token
      );
      this.props.history.push('/');
    } catch (err) {
      this.setState({
        error: err.graphQLErrors.length
          ? 'Invalid username / password'
          : 'Something wrong happenned - check your connection'
      });
      this.setState({ loading: false });
    }
  };

  render = _ =>
    <section className="section">
      <div className="container">
        <div className="columns is-centered">
          <div className="column is-half-tablet">
            <form onSubmit={this.submit}>
              <button type="submit" style={{ display: 'none' }} />
              <div className="card">
                <header className="card-header">
                  <div
                    className="card-header-title has-text-centered"
                    style={{ display: 'block' }}
                  >
                    Restricted area
                  </div>
                </header>
                <div className="card-content has-text-centered">
                  <div className="field">
                    <div className="control has-icons-left">
                      <input
                        autoFocus
                        type="text"
                        className="input"
                        placeholder="Username"
                        value={this.state.username}
                        onChange={this.change.bind(this, 'username')}
                        disabled={this.state.loading}
                      />
                      <span className="icon is-small is-left">
                        <i className="fa fa-user" />
                      </span>
                    </div>
                  </div>
                  <div className="field">
                    <div className="control has-icons-left">
                      <input
                        type="password"
                        className="input"
                        placeholder="Password"
                        value={this.state.password}
                        onChange={this.change.bind(this, 'password')}
                        disabled={this.state.loading}
                      />
                      <span className="icon is-small is-left">
                        <i className="fa fa-key" />
                      </span>
                    </div>
                  </div>
                  <p className="help is-danger">
                    {this.state.error}
                  </p>
                </div>
                <footer className="card-footer">
                  <div className="control card-footer-item">
                    <a
                      className={`button ${this.state.loading
                        ? 'is-loading'
                        : ''}`}
                      onClick={this.submit}
                    >
                      Log in
                    </a>
                  </div>
                </footer>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>;
}

export default compose(graphql(query), withRouter)(Login);
