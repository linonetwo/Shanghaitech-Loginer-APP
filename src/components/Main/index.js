import React, { Component } from 'react';
import {
  Text,
  View
} from 'react-native';

import {
  MKTextField,
  MKColor,
  mdl,
} from 'react-native-material-kit';

import { autobind } from 'core-decorators';

import LoginCard from '../LoginCard';

import styles from './styles';

class APP extends Component {
  state = {
    userName: 's-sunwei',
    password: '113513',
    userNameEdited: 's-sunwei',
    passwordEdited: '113513',
    onEditing: false
  };

  componentWillMount() {
    this._TextfieldWithFloatingLabel = MKTextField.textfieldWithFloatingLabel()
      .withPlaceholder('userName')
      .withStyle(styles.textfieldWithFloatingLabel)
      .withFloatingLabelFont({
        fontSize: 10,
        fontStyle: 'italic',
        fontWeight: '200',
      })
      .withOnChangeText((string) => this.setState({ userNameEdited: string }))
      .build();

    this._PasswordInput = mdl.Textfield.textfieldWithFloatingLabel()
      .withPassword(true)
      .withPlaceholder('Password')
      .withHighlightColor(MKColor.Lime)
      .withStyle(styles.textfieldWithFloatingLabel)
      .withOnChangeText((string) => this.setState({ passwordEdited: string }))
      .build();
  }

  @autobind
  changeEditState() {
    this.setState({ onEditing: !this.state.onEditing });

    if (this.state.userName !== this.state.userNameEdited || this.state.password !== this.state.passwordEdited) { // 说明编辑过了
      this.setState({ userName: this.state.userNameEdited, password: this.state.passwordEdited });
    }
  }

  render() {
    const TextfieldWithFloatingLabel = this._TextfieldWithFloatingLabel;
    const PasswordInput = this._PasswordInput;
    return (
      <View style={styles.container}>
        <LoginCard userName={this.state.userName} password={this.state.password} changeEditState={this.changeEditState} />
        {this.state.onEditing ? <View>
          <TextfieldWithFloatingLabel defaultValue={this.state.userName} />
          <PasswordInput defaultValue={this.state.password} />
        </View> : null}
        <Text style={styles.author}>
          By linonetwo with ♥
        </Text>
      </View>
    );
  }
}
