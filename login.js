var randomString = require('make-random-string');

import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View
} from 'react-native';

import { Card } from 'react-native-material-design';

var poll = require('when/poll');

export function getQuery(userName, password) {
  const cookieCode = randomString(32,'zyxwvutsrqponmlkjihgfedcba1234567890');
  const headers = {'Content-type': 'application/x-www-form-urlencoded', 'Accept': '*/*','Cookie': 'JSESSIONID=' + cookieCode};


  return {'query': fetch('https://controller.shanghaitech.edu.cn:8445/PortalServer/Webauth/webAuthAction!login.action', {
    'method': 'POST',
    headers,
    'mode': 'cors',
    'body': `userName=${userName}&password=${password}&authLan=zh_CN&hasValidateCode=false`
  }),
  headers}
}


export function getResult(queryPromise) {
  return queryPromise.then(res => {

    if (res['status'] != 200) { // 如果失败了，返回一下必要的信息
      return {'logined': false, 'data': 'status number isn\'t 200, maybe network isn\'t available, ask your friend for help.'};
    }

    if (res['ok'] != true) { // 有时候账号被封了，或者输错了密码
      return {'logined': false, 'data': 'login failed, though network is ok, so maybe passward is wrong or this account is not available now.'};
    }
    // 如果都没问题，就取出返回的数据
    return res.json().then(result => {

      if (result['success'] == false) {
        return {'logined': false, 'data': result['message']};
      }
      let data = result['data'];
      return {'logined': true, data};
    })
  })
  .catch(err => {
    return {'logined': false, 'data': err['name']}
  });
}


export function heartBeat(data, headers) {
  return fetch('https://controller.shanghaitech.edu.cn:8445/PortalServer/Webauth/webAuthAction!hearbeat.action', {
    'method': 'POST',
    headers,
    'mode': 'cors',
    'body': `userName=${data['account']}&clientIp=${data['ip']}`
  });
}


export class Loginer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loginState: 'not started yet',
      heartBeatState: '',
      ip: false,
      data: '',
      headers: {},
      heartBeatLoops: 0
    };
  }
  LOOP_LIMIT = 10;
  HEARTBEAT_WAIT = 120000;

  _heartBeatLoop = (userName, password) => {
    const {query, headers} = getQuery(userName, password);

    return getResult(query)
      .then(result => {
        if (result['logined'] == false) {
          this.setState({
            loginState: 'failed!',
            data: result['data'],
            heartBeatState: '',
            ip: false
          });
          return Promise.reject();
        }
        return this.setState({
          loginState: 'succeed!',
          ip: result['data']['ip'],
          data: result['data'],
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
              this.setState({heartBeatState: `heartBeat: ${loops}`, heartBeatLoops: loops});
              return loops;
            });
        }, this.HEARTBEAT_WAIT, (loops) => loops >= this.LOOP_LIMIT, false)) // 循环等待时间是 this.HEARTBEAT_WAIT ms， 直到第一个函数的返回值 loops 大于等于 this.LOOP_LIMIT 才停下
  }

  _lastJob = {};
  componentDidMount() {
    this._heartBeatLoop(this.props.userName, this.props.password)
      .then(() => {
        if (this.state.ip) {
          this._lastJob = setInterval(this._heartBeatLoop, (this.HEARTBEAT_WAIT * this.LOOP_LIMIT + 5)); // 主循环， 一直干 ， 不停
        }
      })
      .catch((err) => this.setState({data: err}))
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.userName != this.props.userName || nextProps.password != this.props.password) {
      clearInterval(this._lastJob);
      this.setState({
        loginState: 'not started yet',
        heartBeatState: '',
        ip: false,
        data: '',
        headers: {},
        heartBeatLoops: 0
      });
      this._heartBeatLoop(nextProps.userName, nextProps.password)
        .then(() => {
          if (this.state.ip) {
            this._lastJob = setInterval(this._heartBeatLoop, (this.HEARTBEAT_WAIT * this.LOOP_LIMIT + 5)); // 主循环， 一直干 ， 不停
          }
        })
        .catch((err) => this.setState({data: err}))
    }
  }



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
            {this.state.ip?this.state.ip:'Touch'}
          </Text>
        </View>
      </Card>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    marginTop: 5
  },
  state: {
    fontSize: 24,
    textAlign: 'center',
    margin: 2,
  },
  instructions: {
    textAlign: 'center',
    color: '#BBBBBB',
    marginBottom: 5,
    marginTop: 35
  },
});
