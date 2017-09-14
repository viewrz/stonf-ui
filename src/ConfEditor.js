import React, { Component } from 'react';
import { graphql, gql, compose } from 'react-apollo';

const toVarsArray = varsObj =>
  Object.keys(varsObj).map(key => ({ key, value: varsObj[key] }));
const toVarsObj = varsArray => {
  const out = {};
  varsArray.forEach(v => v.key && (out[v.key] = v.value));
  return out;
};

export default compose(
  graphql(
    gql`
      mutation($name: String!, $vars: JSON!) {
        createConf(name: $name, vars: $vars) {
          _id
          name
          vars
        }
      }
    `,
    { name: 'createConfMutation' }
  ),
  graphql(
    gql`
      mutation($_id: ID!, $name: String!, $vars: JSON!) {
        updateConf(_id: $_id, name: $name, vars: $vars) {
          _id
          name
          vars
        }
      }
    `,
    { name: 'updateConfMutation' }
  )
)(
  class ConfEditor extends Component {
    constructor(props) {
      super(props);
      this.state = {
        loading: false,
        error: '',
        isEditingName: false,
        conf: {
          name: this.props.conf ? this.props.conf.name : '',
          varsArray: this.props.conf
            ? toVarsArray(this.props.conf.vars)
            : [{ key: '', value: '' }]
        }
      };
    }

    addKey = _ =>
      this.setState(s => s.conf.varsArray.push({ key: '', value: '' }) && s);

    removeKey = idx => this.setState(s => s.conf.varsArray.splice(idx, 1) && s);

    change = ({ type, idx }, e) => {
      const value = e.target.value;
      this.setState(s => {
        s.error = '';
        if (type === 'name') s.conf.name = value;
        else s.conf.varsArray[idx][type] = value;
        return s;
      });
    };

    createConf = _ =>
      this.props.createConfMutation({
        variables: {
          name: this.state.conf.name,
          vars: toVarsObj(this.state.conf.varsArray)
        },
        update: (cache, { data: { createConf: newConf } }) => {
          const query = gql('{confs {_id}}');
          const data = cache.readQuery({ query });
          data.confs.unshift(newConf);
          cache.writeQuery({ query, data });
        }
      });

    updateConf = _ =>
      this.props.updateConfMutation({
        variables: {
          _id: this.props.conf._id,
          name: this.state.conf.name,
          vars: toVarsObj(this.state.conf.varsArray)
        }
      });

    submit = async e => {
      e.preventDefault();
      if (!this.state.conf.name)
        return this.setState({ error: 'Please name this conf' });
      this.setState({ loading: true });
      await this[this.props.conf ? 'updateConf' : 'createConf']();
      this.props.close();
    };

    render = _ =>
      <form onSubmit={this.submit}>
        <button type="submit" style={{ display: 'none' }} />
        <div className="modal-card">
          <header className="modal-card-head">
            {this.props.conf && !this.state.isEditingName
              ? <div
                  onClick={this.setState.bind(
                    this,
                    { isEditingName: true },
                    null
                  )}
                >
                  <p className="modal-card-title">
                    {this.props.conf.name}
                  </p>
                  <div className="help">
                    <span className="icon is-small">
                      <i className="fa fa-arrow-up" />
                    </span>{' '}
                    click to edit
                  </div>
                </div>
              : <div className="control is-expanded" style={{ flexGrow: 1 }}>
                  <input
                    style={{ margin: '5px 0' }}
                    autoFocus
                    type="text"
                    className="input"
                    placeholder={
                      (this.props.conf && this.props.conf.name) || 'Conf name'
                    }
                    value={this.state.conf.name}
                    onChange={this.change.bind(this, { type: 'name' })}
                    disabled={this.state.loading}
                  />
                </div>}
          </header>
          <section className="modal-card-body">
            {this.state.conf.varsArray.map(({ key, value }, idx) =>
              <div className="field has-addons" key={idx}>
                <div className="control is-expanded">
                  <input
                    type="text"
                    className="input"
                    placeholder="KEY"
                    value={key}
                    onChange={this.change.bind(this, { type: 'key', idx })}
                    disabled={this.state.loading}
                  />
                </div>
                <div className="control is-expanded">
                  <input
                    type="text"
                    className="input"
                    placeholder="value"
                    value={value}
                    onChange={this.change.bind(this, { type: 'value', idx })}
                    disabled={this.state.loading}
                  />
                </div>
                <div className="control">
                  <a
                    onClick={this.removeKey.bind(this, idx)}
                    disabled={this.state.loading}
                    className="button"
                  >
                    <span className="icon">
                      <i className="fa fa-remove" />
                    </span>
                  </a>
                </div>
              </div>
            )}
            <a
              disabled={this.state.loading}
              className="button is-outlined is-primary"
              onClick={this.addKey}
            >
              <span className="icon">
                <i className="fa fa-plus" />
              </span>
            </a>
            {this.state.error &&
              <p className="help is-danger">
                {this.state.error}
              </p>}
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
              {this.props.conf ? 'Save' : 'Create'}
            </button>
          </footer>
        </div>
      </form>;
  }
);
