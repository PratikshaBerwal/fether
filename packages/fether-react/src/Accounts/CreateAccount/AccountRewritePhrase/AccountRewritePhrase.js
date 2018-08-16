// Copyright 2015-2018 Parity Technologies (UK) Ltd.
// This file is part of Parity.
//
// SPDX-License-Identifier: BSD-3-Clause

import React, { Component } from 'react';
import { AccountCard, Card, Form as FetherForm } from 'fether-ui';
import debounce from 'lodash/debounce';
import { inject, observer } from 'mobx-react';

@inject('createAccountStore')
@observer
class AccountRewritePhrase extends Component {
  state = {
    value: ''
  };

  handleChange = ({ target: { value } }) => {
    const {
      createAccountStore: { isImport, setPhrase }
    } = this.props;

    this.setState({ value });

    // If we're importing, we show the current address generated by the current
    // recovery phrase
    if (isImport && value) {
      setPhrase(null); // Don't wait for debounce to disable button
      this.handleSavePhrase();
    }
  };

  handleNextStep = () => {
    const {
      history,
      location: { pathname }
    } = this.props;
    const currentStep = pathname.slice(-1);

    history.push(`/accounts/new/${+currentStep + 1}`);
  };

  handleSavePhrase = debounce(() => {
    const {
      createAccountStore: { setPhrase }
    } = this.props;
    const { value } = this.state;

    return setPhrase(value);
  }, 1000);

  render () {
    const {
      createAccountStore: { address, isImport, name },
      history,
      location: { pathname }
    } = this.props;
    const { value } = this.state;
    const currentStep = pathname.slice(-1);
    const body = [
      <div key='createAccount'>
        <div className='text'>
          {isImport ? (
            <p>Type your Recovery phrase</p>
          ) : (
            <p>
              Type your secret phrase to confirm that you wrote it down
              correctly:
            </p>
          )}
        </div>
        <FetherForm.Field
          as='textarea'
          label='Recovery phrase'
          onChange={this.handleChange}
          required
          value={value}
        />

        <nav className='form-nav -space-around'>
          {currentStep > 1 && (
            <button className='button -cancel' onClick={history.goBack}>
              Back
            </button>
          )}
          {this.renderButton()}
        </nav>
      </div>
    ];

    return isImport ? (
      <Card>{body}</Card>
    ) : (
      <AccountCard
        address={address}
        name={address && !name ? '(no name)' : name}
        drawers={[body]}
      />
    );
  }

  renderButton = () => {
    const {
      createAccountStore: { isImport, phrase, address }
    } = this.props;
    const { value } = this.state;

    // If we are creating a new account, the button just checks the phrase has
    // been correctly written by the user.
    if (!isImport) {
      return (
        <button
          className='button'
          disabled={value !== phrase}
          onClick={this.handleNextStep}
        >
          Next
        </button>
      );
    }

    // If we are importing an existing account, the button goes to the next step
    return (
      <button
        className='button'
        disabled={!address}
        onClick={this.handleNextStep}
      >
        Next
      </button>
    );
  };
}

export default AccountRewritePhrase;
