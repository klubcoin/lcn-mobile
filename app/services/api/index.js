import routes from 'common/routes';
import Config from 'app/config.js';
import * as base64 from 'base-64';
import { queryParamsURLEncodedString } from '../WebService';

const Api = {
	postRequest: (method, parameters, callback, errorCallback = null) => {
		let url = routes.mainNetWork.url;
		const fetchOptions = {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				...routes.basicMethod,
				method: method,
				params: parameters
			})
		};
		console.log('url', url);
		console.log('fetchOptions', fetchOptions);
		fetch(url, fetchOptions)
			.then(response => response.json())
			.then(json => {
				callback(json);
			})
			.catch(error => {
				if (errorCallback) {
					errorCallback(error);
				}
			});
	},
	directPostRequest: (url, parameters, callback, errorCallback = null) => {
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
			method: 'POST',
			headers,
			body: JSON.stringify(parameters?.rawBody ? parameters.rawBody : parameters)
		};
		console.log('url', url);
		console.log('fetchOptions', fetchOptions);
		fetch(url, fetchOptions)
			.then(response => response.text())
			.then(text => {
				try {
					callback(JSON.parse(text));
				} catch (e) {
					errorCallback && errorCallback(text);
				}
			})
			.catch(error => {
				if (errorCallback) {
					errorCallback(error);
				}
			});
	},
	standardPostRequest: (route, parameters, callback, errorCallback = null) => {
		let url = routes.mainNetWork.route + route;
		Api.directPostRequest(url, parameters, callback, errorCallback);
	},
	directGetRequest: (url, parameters, callback, errorCallback = null) => {
		const headers = {};

		if (parameters?.basicAuth) {
			headers.Authorization = `Basic ${base64.encode(parameters.basicAuth)}`;
			delete parameters.basicAuth;
		} else if (parameters?.jwt) {
			headers.Authorization = `Bearer ${parameters.jwt}`;
			delete parameters.jwt;
		}
		const route = url + '?' + queryParamsURLEncodedString(parameters || {});

		const fetchOptions = {
			method: 'GET',
			headers
		};
		fetch(route, fetchOptions)
			.then(response => response.text())
			.then(text => {
				try {
					return JSON.parse(text);
				} catch (e) {
					console.log('error', route, e)
					return text;
				}
			})
			.then(json => {
				callback(json);
			})
			.catch(error => {
				if (errorCallback) {
					errorCallback(error);
				}
			});
	},
	getRequest: (route, callback, errorCallback = null) => {
		let url = routes.mainNetWork.route + route;
		const fetchOptions = {
			method: 'GET',
			headers: {
				Accept: 'application/json'
			}
		};
		console.log(route);
		fetch(url, fetchOptions)
			.then(response => response.text())
			.then(text => {
				try {
					callback(JSON.parse(text));
				} catch (e) {
					errorCallback && errorCallback(text);
				}
			})
			.catch(error => {
				if (errorCallback) {
					errorCallback(error);
				}
			});
	},
	paypalPostRequest: (callback, errorCallback = null) => {
		let username = null;
		let password = null;
		const fetchOptions = {
			method: 'POST',
			headers: {
				Authorization:
					'Basic ' +
					base64.encode(
						Config.paypalCredentials.sandbox.clientId + ':' + Config.paypalCredentials.sandbox.secret
					),
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			body: 'grant_type=client_credentials'
		};
		console.log(fetchOptions);
		fetch('https://api-m.sandbox.paypal.com/v1/oauth2/token', fetchOptions)
			.then(response => response.json())
			.then(json => {
				callback(json);
			})
			.catch(error => {
				if (errorCallback) {
					errorCallback(error.message);
				}
			});
	},
	paypalCreateOrderRequest: (data, token, callback, errorCallback = null) => {
		const fetchOptions = {
			method: 'POST',
			headers: {
				Authorization: 'Bearer ' + token,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(data)
		};
		console.log(fetchOptions);
		fetch('https://api-m.sandbox.paypal.com/v2/checkout/orders', fetchOptions)
			.then(response => response.json())
			.then(json => {
				callback(json);
			})
			.catch(error => {
				if (errorCallback) {
					errorCallback(error.message);
				}
			});
	}
};

export default Api;
