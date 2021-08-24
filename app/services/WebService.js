import api from './api'

export default class WebService {

  static sendGet(url, data, callback) {
    const route = url + '?' + queryParamsURLEncodedString(data || {});

    api.getRequest(route, (json) => {
      callback(true, json)
    }, (error) => {
      callback(false, error);
    });
  }
}

export const queryParamsURLEncodedString = (params) => {
  return Object.keys(params).map(k => (
    Array.isArray(params[k]))
    ? params[k].map(p => encodeURIComponent(k) + '=' + encodeURIComponent(p)).join('&')
    : params[k] instanceof Object
      ? Object.keys(params[k]).map(pk => `${k}[${pk}]=${encodeURIComponent(params[k][pk])}`).join('&')
      : encodeURIComponent(k) + '=' + encodeURIComponent(params[k])
  ).join('&');
};