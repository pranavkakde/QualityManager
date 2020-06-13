var axios = require('axios');

exports.apiGetHandler = function bypassRequest(url){    
    return new Promise((resolve, reject) => {
      axios.get(url)
        .then(resp=>{
            console.log(resp.data)
            resolve(resp.data)
        })
        .catch(err=>{
          reject(err)
        });
    })
}

exports.apiPutHandler =(url,body)=>{
  return new Promise((resolve, reject) => {
    axios.put(url, {...body})
      .then(resp=>{
          resolve(resp.data)
      })
      .catch(err=>{
        reject(err)
      });
  })
}

exports.apiPostHandler = function bypassRequest(url,body){
  return new Promise((resolve, reject) => {
    axios.post(url, {...body})
      .then(resp=>{
          resolve(resp.data)
      })
      .catch(err=>{
        reject(err)
      });
  })
}

exports.apiDeleteHandler = function bypassRequest(url){
  return new Promise((resolve, reject) => {
    axios.delete(url)
      .then(resp=>{
          resolve(resp.data)
      })
      .catch(err=>{
        reject(err)
      });
  })
}