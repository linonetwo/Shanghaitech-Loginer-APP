/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View
} from 'react-native';

import { Loginer } from './login';

import {
  MKTextField,
  MKColor,
  mdl,
} from 'react-native-material-kit';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  author: {
    alignItems: 'center',
    marginTop: 100
  },
  switchAccountButton: {
    width: 60
  },
  textfieldWithFloatingLabel: {
    height: 48,  // have to do it on iOS
    marginTop: 10,
  },
});





class APP extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userName: 's-sunwei',
      password: '113513',
      userNameEdited: 's-sunwei',
      passwordEdited: '113513',
      onEditing: false
    };
  }

  _changeEditState = () => {
    this.setState({onEditing: !this.state.onEditing});

    if (this.state.userName != this.state.userNameEdited || this.state.password != this.state.passwordEdited) { // 说明编辑过了
      this.setState({userName: this.state.userNameEdited, password: this.state.passwordEdited});
    }
  }

  componentWillMount() {
    this._TextfieldWithFloatingLabel = MKTextField.textfieldWithFloatingLabel()
      .withPlaceholder('userName')
      .withStyle(styles.textfieldWithFloatingLabel)
      .withFloatingLabelFont({
        fontSize: 10,
        fontStyle: 'italic',
        fontWeight: '200',
      })
      .withOnChangeText((string) => this.setState({userNameEdited: string}))
      .build();

    this._PasswordInput = mdl.Textfield.textfieldWithFloatingLabel()
      .withPassword(true)
      .withPlaceholder('Password')
      .withHighlightColor(MKColor.Lime)
      .withStyle(styles.textfieldWithFloatingLabel)
      .withOnChangeText((string) => this.setState({passwordEdited: string}))
      .build();
  }


  render() {
    const TextfieldWithFloatingLabel = this._TextfieldWithFloatingLabel;
    const PasswordInput = this._PasswordInput;
    return (
      <View style={styles.container}>
        <Loginer userName={this.state.userName} password={this.state.password} changeEditState={this._changeEditState}/>
        {this.state.onEditing?<View>
          <TextfieldWithFloatingLabel defaultValue={this.state.userName}/>
          <PasswordInput defaultValue={this.state.password}/>
          </View>:null}
        <Text style={styles.author}>
          @onetwo by ReactNative
        </Text>
      </View>
    );
  }
}


AppRegistry.registerComponent('loginer', () => APP);
