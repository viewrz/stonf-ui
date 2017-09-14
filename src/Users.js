import React, { Component } from 'react';
import withModal from './withModal';
import { graphql, gql } from 'react-apollo';

const AddUser = graphql(
  gql`
    mutation($username: String!, $password: String!) {
      createUser(username: $username, password: $password) {
        username
      }
    }
  `
)(
  class AddUser extends Component {
    state = { username: '', password: '', error: '', loading: false };
    change = (key, e) => this.setState({ [key]: e.target.value, error: '' });

    submit = async e => {
      e.preventDefault();
      this.setState({ loading: true });
      try {
        await this.props.mutate({
          variables: this.state,
          update: (cache, { data: { createUser: newUser } }) => {
            const query = gql('{users {username}}');
            const data = cache.readQuery({ query });
            data.users.unshift(newUser);
            cache.writeQuery({ query, data });
          }
        });
        this.props.close();
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
      <div className="modal-card">
        <header className="modal-card-head">
          <p className="modal-card-title">New user</p>
        </header>
        <section className="modal-card-body">
          <form onSubmit={this.submit}>
            <button type="submit" style={{ display: 'none' }} />
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
            Create
          </button>
        </footer>
      </div>;
  }
);

const DeleteUser = graphql(
  gql`
    mutation($username: String!) {
      deleteUser(username: $username) {
        username
      }
    }
  `
)(
  class DeleteUser extends Component {
    state = { loading: false };

    remove = async _ => {
      this.setState({ loading: true });
      await this.props.mutate({
        variables: this.props.data,
        update: cache => {
          const query = gql('{users {username}}');
          const data = cache.readQuery({ query });
          data.users = data.users.filter(
            c => c.username !== this.props.data.username
          );
          cache.writeQuery({ query, data });
        }
      });
      this.props.close();
    };

    render = _ =>
      <div className="modal-card">
        <header className="modal-card-head">
          <p className="modal-card-title has-text-centered has-text-primary">
            <span className="icon is-medium">
              <i className="fa fa-warning" />
            </span>
          </p>
        </header>
        <section className="modal-card-body has-text-centered">
          Are you sure to delete
          <strong className="has-text-primary">
            {' '}{this.props.data.username}
          </strong>{' '}
          ?
        </section>
        <footer
          style={{ justifyContent: 'center' }}
          className="modal-card-foot"
        >
          <a
            onClick={this.remove}
            className={`button is-primary ${this.state.loading
              ? 'is-loading'
              : ''}`}
          >
            Yes
          </a>
        </footer>
      </div>;
  }
);

export default graphql(gql`
  {
    users {
      username
    }
  }
`)(
  withModal(props =>
    <div>
      <section className="section" style={{ paddingBottom: 0 }}>
        <div className="container has-text-centered">
          <a
            onClick={props.promptModal.bind(
              this,
              <AddUser close={props.closeModal} />
            )}
            className="button is-primary is-large is-outlined"
          >
            <span className="icon">
              <i className="fa fa-plus" />
            </span>
            <span>Add user</span>
          </a>
        </div>
      </section>
      <section className="section">
        <div className="container">
          {props.data.loading
            ? <div className="has-text-centered">
                <div
                  className="loader is-size-1"
                  style={{ display: 'inline-block' }}
                />
              </div>
            : props.data.users.map(user =>
                <div
                  key={user.username}
                  className="card"
                  style={{ marginBottom: 20 }}
                >
                  <div className="card-content">
                    <div className="is-pulled-right">
                      <a
                        className="button is-small"
                        onClick={props.promptModal.bind(
                          this,
                          <DeleteUser data={user} close={props.closeModal} />
                        )}
                      >
                        Delete
                      </a>
                    </div>
                    <span>
                      {user.username}
                    </span>
                  </div>
                </div>
              )}
        </div>
      </section>
    </div>
  )
);
