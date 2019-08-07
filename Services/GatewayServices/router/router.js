var request = require('request');
var apiHandler= function bypassRequest(url){
    return new Promise((resolve, reject) => {
        request(url, { json: true }, (err, res, body) => {
          if (err) reject(err)
          resolve(body)
        });
    })
}
module.exports = apiHandler;