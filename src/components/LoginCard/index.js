import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View
} from 'react-native';

import { autobind } from 'core-decorators';

import { Card } from 'react-native-material-design';

import poll from 'when/poll';
import { getQuery, getResult, heartBeat } from '../../auth';

import styles from './styles';

type propType = {
  userName: string;
  password: string;
}

export default class Loginer extends Component {
  static propTypes = propType;

  state = {
    loginState: 'not started yet',
    heartBeatState: '',
    ip: false,
    data: '',
    headers: {},
    heartBeatLoops: 0
  };

  componentDidMount() {
    this.heartBeatLoop(this.props.userName, this.props.password)
      .then(() => {
        if (this.state.ip) {
          this.lastLoopTimer = setInterval(this.heartBeatLoop, ((this.HEARTBEAT_WAIT * this.LOOP_LIMIT) + 5)); // 主循环， 一直干 ， 不停
        }
      })
      .catch((err) => this.setState({ data: err }));
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.userName !== this.props.userName || nextProps.password !== this.props.password) {
      clearInterval(this.lastLoopTimer);
      this.setState({
        loginState: 'not started yet',
        heartBeatState: '',
        ip: false,
        data: '',
        headers: {},
        heartBeatLoops: 0
      });
      this.heartBeatLoop(nextProps.userName, nextProps.password)
        .then(() => {
          if (this.state.ip) {
            this.lastLoopTimer = setInterval(this.heartBeatLoop, ((this.HEARTBEAT_WAIT * this.LOOP_LIMIT) + 5)); // 主循环， 一直干 ， 不停
          }
        })
        .catch((err) => this.setState({ data: err }));
    }
  }

  @autobind
  heartBeatLoop(userName, password) {
    const { query, headers } = getQuery(userName, password);

    return getResult(query)
      .then(result => {
        if (result.logined === false) {
          this.setState({
            loginState: 'failed!',
            data: result.data,
            heartBeatState: '',
            ip: false
          });
          return Promise.reject();
        }
        return this.setState({
          loginState: 'succeed!',
          ip: result.data.ip,
          data: result.data,
          headers,
          heartBeatState: 'heartBeat: 0',
          heartBeatLoops: 0
        });
      })
      .then(() => poll(() => { // 开始心跳循环
        let loops = this.state.heartBeatLoops;
        return getResult(heartBeat(this.state.data, this.state.headers))
          .then(result => {
            ++loops;
            this.setState({ heartBeatState: `heartBeat: ${loops}`, heartBeatLoops: loops });
            return loops;
          });
      }, this.HEARTBEAT_WAIT, (loops) => loops >= this.LOOP_LIMIT, false)); // 循环等待时间是 this.HEARTBEAT_WAIT ms， 直到第一个函数的返回值 loops 大于等于 this.LOOP_LIMIT 才停下
  }

  LOOP_LIMIT = 10;
  HEARTBEAT_WAIT = 120000;
  lastLoopTimer = {};

  render() {
    return (
      <Card onPress={this.props.changeEditState}>
        <View style={styles.container}>
          <Text style={styles.instructions}>
            Current Login State:
          </Text>
          <Text style={styles.state}>
            {this.state.loginState}
          </Text>
          <Text style={styles.state}>
            {this.state.heartBeatState}
          </Text>
          <Text style={styles.instructions}>
            {this.state.ip ? this.state.ip : 'Touch'}
          </Text>
        </View>
      </Card>
    );
  }
}
