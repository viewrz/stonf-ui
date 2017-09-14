import React, { Component } from 'react';

export default SubComp =>
  class extends Component {
    state = { modal: null };

    promptModal = async element => {
      const newState = { modal: { element } };
      const result = new Promise(resolve => {
        newState.modal.close = resolve;
      });
      this.setState(newState);
      await result;
      this.setState({ modal: null });
      return result;
    };

    closeModal = result =>
      this.state.modal ? this.state.modal.close(result) : null;

    keyDown = e => (e.keyCode === 27 ? this.closeModal() : null);

    render = _ => {
      const m = this.state.modal;
      return (
        <div>
          {m
            ? <div className="modal is-active" onKeyDown={this.keyDown}>
                <div
                  className="modal-background"
                  onClick={m.close.bind(this, null)}
                />
                {m.element}
                <button
                  className="modal-close is-large"
                  onClick={m.close.bind(this, null)}
                />
              </div>
            : null}
          <SubComp
            promptModal={this.promptModal}
            closeModal={this.closeModal}
            {...this.props}
          />
        </div>
      );
    };
  };
