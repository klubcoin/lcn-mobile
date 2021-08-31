import api from './api'

export default class WebService {

  static sendGetDirect(url, data, callback) {
    const route = url + '?' + queryParamsURLEncodedString(data || {});
    api.directGetRequest(route, (json) => {
      callback(true, json)
    }, (error) => {
      callback(false, error);
    });
  }

  static sendPostDirect(url, data, callback) {
    api.directPostRequest(url, data, (json) => {
      callback(true, json)
    }, (error) => {
      callback(false, error);
    });
  }

  static sendGet(path, data, callback) {
    const route = path + '?' + queryParamsURLEncodedString(data || {});

    api.getRequest(route, (json) => {
      callback(true, json)
    }, (error) => {
      callback(false, error);
    });
  }

  static sendPost(path, data, callback) {
    api.standardPostRequest(path, data, (json) => {
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