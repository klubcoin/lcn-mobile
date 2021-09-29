import api from './api'
import * as base64 from 'base-64';

export default class WebService {

  static sendGetDirect(url, data, callback) {
    api.directGetRequest(url, data, (json) => {
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

  static sendDelete(url, parameters, callback) {
    WebService.sendFetch('DELETE', url, parameters, callback);
  }

  static sendFetch(method, url, parameters, callback) {
    const headers = { 'Content-Type': 'application/json' };

    if (parameters?.basicAuth) {
      headers.Authorization = `Basic ${base64.encode(parameters.basicAuth)}`;
      delete parameters.basicAuth;
    } else if (parameters?.jwt) {
      headers.Authorization = `Bearer ${parameters.jwt}`;
      delete parameters.jwt;
    }
    if (parameters.headers) {
      Object.assign(headers, parameters.headers);
    }
    const fetchOptions = {
      method: method || 'POST',
      headers,
      body: JSON.stringify(parameters?.rawBody ? parameters.rawBody : parameters)
    }
    console.log('url', url)
    console.log('fetchOptions', fetchOptions)
    fetch(url, fetchOptions)
      .then(response => response.text())
      .then(text => {
        try {
          const json = JSON.parse(text);
          callback && callback(true, json);
        } catch (e) {
          callback && callback(true, text);
        }
      })
      .catch(error => {
        callback && callback(false, error);
      })
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