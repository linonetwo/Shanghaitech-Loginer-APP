import Promise from 'bluebird';
import randomString from 'make-random-string';

export function getQuery(userName, password) {
  const cookieCode = randomString(32, 'zyxwvutsrqponmlkjihgfedcba1234567890');
  const headers = {
    'Content-type': 'application/x-www-form-urlencoded',
    Accept: '*/*',
    Cookie: 'JSESSIONID=' + cookieCode
  };

  return {
    query: fetch('https://controller.shanghaitech.edu.cn:8445/PortalServer/Webauth/webAuthAction!login.action', {
      method: 'POST',
      headers,
      mode: 'cors',
      body: `userName=${userName}&password=${password}&authLan=zh_CN&hasValidateCode=false`
    }),
    headers
  };
}


export function getResult(queryPromise) {
  return queryPromise
    .then(res => {
      if (res.status !== 200) { // 如果失败了，返回一下必要的信息
        return { logined: false, data: 'status number isn\'t 200, maybe network isn\'t available, ask your friend for help.' };
      }

      if (res.ok !== true) { // 有时候账号被封了，或者输错了密码
        return { logined: false, data: 'login failed, though network is ok, so maybe passward is wrong or this account is not available now.' };
      }
      // 如果都没问题，就取出返回的数据
      return Promise.try(() =>
        res.json()
      )
      .then(result => {
        if (result.success === false) {
          return { logined: false, data: result.message };
        }
        const data = result.data;
        return { logined: true, data };
      });
    })
    .catch(err => ({ logined: false, data: err.name }));
}


export function heartBeat(data, headers) {
  return fetch('https://controller.shanghaitech.edu.cn:8445/PortalServer/Webauth/webAuthAction!hearbeat.action', {
    method: 'POST',
    headers,
    mode: 'cors',
    body: `userName=${data.account}&clientIp=${data.ip}`
  });
}

