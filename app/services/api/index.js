import routes from 'common/routes'
const Api = {
  postRequest: (method, parameters, callback, errorCallback = null) => {
    let url = routes.mainNetWork.url
    const fetchOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json'},
      body: JSON.stringify({
        ...routes.basicMethod,
        method: method,
        params: parameters
      })
    }
    console.log('url', url)
    console.log('fetchOptions', fetchOptions)
    fetch(url, fetchOptions).then(response => response.json()).then(json => {
      callback(json)
    }).catch(error => {
      if(errorCallback){
        errorCallback(error)
      }
    })
  },
  standardPostRequest: (route, parameters, callback, errorCallback = null) => {
    let url = routes.mainNetWork.route + route
    const fetchOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json'},
      body: JSON.stringify(parameters)
    }
    console.log('url', url)
    console.log('fetchOptions', fetchOptions)
    fetch(url, fetchOptions).then(response => response.json()).then(json => {
      callback(json)
    }).catch(error => {
      if(errorCallback){
        errorCallback(error)
      }
    })
  },
  getRequest: (route, callback, errorCallback = null) => {
    let url = routes.mainNetWork.route + route
    const fetchOptions = {
      method: 'GET'
    }
    console.log(route)
    fetch(url, fetchOptions).then(response => response.json()).then(json => {
      callback(json)
    }).catch(error => {
      if(errorCallback){
        errorCallback(error)
      }
    })
  }
}

export default Api;