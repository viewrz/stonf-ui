import copy from 'clipboard-copy';
import React, { Component, Children } from 'react';
import EventEmitter from 'events';
import { object, func } from 'prop-types';

export class ClipboardProvider extends Component {
  clipboardEmitter = new EventEmitter();
  clipboardContent = { value: '' };
  clipboardCopy = s => {
    copy(s);
    this.clipboardContent.value = s;
    this.clipboardEmitter.emit('copy', s);
  };

  static childContextTypes = {
    clipboardContent: object.isRequired,
    clipboardCopy: func.isRequired,
    clipboardEmitter: object.isRequired
  };

  getChildContext = _ => ({
    clipboardContent: this.clipboardContent,
    clipboardCopy: this.clipboardCopy,
    clipboardEmitter: this.clipboardEmitter
  });

  render = _ => Children.only(this.props.children);
}

export const withClipboard = SubComp =>
  class extends Component {
    static contextTypes = ClipboardProvider.childContextTypes;
    componentDidMount() {
      this.context.clipboardEmitter.on('copy', this.handleCopy);
    }
    state = { clipboardContent: this.context.clipboardContent.value };
    handleCopy = s => this.setState({ clipboardContent: s });
    componentWillUnmount = _ =>
      this.context.clipboardEmitter.removeListener('copy', this.handleCopy);
    render = _ =>
      <SubComp
        clipboardCopy={this.context.clipboardCopy}
        clipboardContent={this.state.clipboardContent}
        {...this.props}
      />;
  };
