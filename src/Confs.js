import React, { Component } from 'react';
import { withClipboard } from './withClipboard';
import withModal from './withModal';
import ConfEditor from './ConfEditor';
import { graphql, gql, compose } from 'react-apollo';

const DeleteConfModal = graphql(gql`
  mutation($_id: ID!) {
    deleteConf(_id: $_id) {
      _id
    }
  }
`)(
  class extends Component {
    state = { loading: false };
    confirm = async _ => {
      this.setState({ loading: true });
      await this.props.mutate({
        variables: { _id: this.props.data._id },
        update: cache => {
          const query = gql('{confs {_id}}');
          const data = cache.readQuery({ query });
          data.confs = data.confs.filter(c => c._id !== this.props.data._id);
          cache.writeQuery({ query, data });
        }
      });
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
            {' '}{this.props.data.name}
          </strong>{' '}
          ?
        </section>
        <footer
          style={{ justifyContent: 'center' }}
          className="modal-card-foot"
        >
          <a
            onClick={this.confirm}
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

const Conf = compose(
  withModal,
  withClipboard,
  graphql(gql`
    mutation($_id: ID!) {
      cloneConf(_id: $_id) {
        _id
        name
        vars
      }
    }
  `)
)(
  class extends Component {
    state = {
      isCloning: false
    };

    copy = e => {
      e.stopPropagation();
      this.props.clipboardCopy(this.props.data._id);
    };

    clone = async e => {
      e.stopPropagation();
      this.setState({ isCloning: true });
      await this.props.mutate({
        variables: this.props.data,
        update: (cache, { data: { cloneConf: newConf } }) => {
          const query = gql('{confs {_id}}');
          const data = cache.readQuery({ query });
          data.confs.unshift(newConf);
          cache.writeQuery({ query, data });
        }
      });
      this.setState({ isCloning: false });
    };

    remove = e => {
      e.stopPropagation();
      this.props.promptModal(<DeleteConfModal data={this.props.data} />);
    };

    render = _ =>
      <div
        className="card"
        style={{ marginBottom: 20, cursor: 'pointer' }}
        onClick={this.props.promptModal.bind(
          this,
          <ConfEditor conf={this.props.data} close={this.props.closeModal} />
        )}
      >
        <div className="card-content">
          <div className="is-pulled-right">
            <a
              className="button is-small"
              disabled={this.state.isCloning}
              onClick={this.clone}
              style={{ marginRight: 5 }}
            >
              <span className="icon is-small">
                <i className="fa fa-copy" />
              </span>
            </a>
            <a className="button is-small" onClick={this.remove}>
              <span className="icon is-small">
                <i className="fa fa-remove" />
              </span>
            </a>
          </div>
          <strong className="has-text-primary" style={{ marginRight: '1em' }}>
            {this.props.data.name}
          </strong>
          <span style={{ display: 'inline-block' }}>
            <code
              style={{
                fontWeight: 'normal',
                fontSize: '0.8em',
                marginRight: '1em'
              }}
            >
              {this.props.data._id}
            </code>
            <a className="button is-small" onClick={this.copy}>
              <span
                className={`icon is-small ${this.props.clipboardContent ===
                this.props.data._id
                  ? 'has-text-success'
                  : ''}`}
              >
                <i className="fa fa-clipboard" />
              </span>
            </a>
          </span>
          <hr />
          <div>
            {Object.keys(this.props.data.vars).join(', ')}
          </div>
        </div>
      </div>;
  }
);

export default graphql(gql`
  {
    confs {
      _id
      name
      vars
    }
  }
`)(
  withModal(props =>
    <div>
      <section className="section" style={{ paddingBottom: 0 }}>
        <div className="container has-text-centered">
          <a
            className="button is-primary is-large is-outlined"
            onClick={props.promptModal.bind(
              this,
              <ConfEditor close={props.closeModal} />
            )}
          >
            <span className="icon">
              <i className="fa fa-plus" />
            </span>
            <span>New conf</span>
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
            : props.data.confs.map(conf => <Conf key={conf._id} data={conf} />)}
        </div>
      </section>
    </div>
  )
);
