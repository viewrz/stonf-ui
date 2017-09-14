import React, { Component } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { setAuthToken } from './auth';
import withModal from './withModal';
import { graphql, gql } from 'react-apollo';

const ChangePass = graphql(gql`
  mutation($newPassword: String!) {
    changePassword(newPassword: $newPassword) {
      token
    }
  }
`)(
  class extends Component {
    state = { newPassword: '', loading: false, error: '' };

    change = e => this.setState({ newPassword: e.target.value, error: '' });

    submit = async e => {
      e.preventDefault();
      if (!this.state.newPassword)
        return this.setState({ error: 'Please enter a new password' });
      this.setState({ loading: true });
      setAuthToken(
        (await this.props.mutate({ variables: this.state })).data.changePassword
          .token
      );
      this.props.close();
    };

    render = _ =>
      <div className="modal-card">
        <header className="modal-card-head">
          <p className="modal-card-title">Change password</p>
        </header>
        <section className="modal-card-body">
          <form onSubmit={this.submit}>
            <button type="submit" style={{ display: 'none' }} />
            <div className="field">
              <div className="control has-icons-left">
                <input
                  autoFocus
                  type="password"
                  className="input"
                  placeholder="New password"
                  value={this.state.newPassword}
                  onChange={this.change}
                  disabled={this.state.loading}
                />
                <span className="icon is-small is-left">
                  <i className="fa fa-key" />
                </span>
              </div>
            </div>
            {this.state.error &&
              <p className="help is-danger">
                {this.state.error}
              </p>}
          </form>
        </section>
        <footer
          className="modal-card-foot"
          style={{ justifyContent: 'center' }}
        >
          <button
            className={`button is-primary ${this.state.loading
              ? 'is-loading'
              : ''}`}
            onClick={this.submit}
          >
            Save
          </button>
        </footer>
      </div>;
  }
);

export default withModal(
  class extends Component {
    logout = () => {
      setAuthToken(null);
      window.location.reload();
    };

    render = _ =>
      <nav className="navbar">
        <div className="container">
          <div className="navbar-brand">
            <NavLink
              to="/confs"
              className="navbar-item"
              activeClassName="has-text-primary"
            >
              Confs
            </NavLink>
            <NavLink
              to="/users"
              className="navbar-item"
              activeClassName="has-text-primary"
            >
              Users
            </NavLink>
            <div className="end">
              <div className="navbar-item with-button">
                <div className="control">
                  <a
                    onClick={this.props.promptModal.bind(
                      this,
                      <ChangePass close={this.props.closeModal} />
                    )}
                    className="button is-small"
                  >
                    Chg pass
                  </a>
                </div>
              </div>
              <div className="navbar-item with-button">
                <div className="control">
                  <Link
                    to="/"
                    onClick={this.logout}
                    className="button is-small"
                  >
                    Log out
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>;
  }
);
