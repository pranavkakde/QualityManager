var apihandler=require('./router');
var disc = require('./servicedisc');

exports.getProxy=(req, res, next) =>{
    console.log(`${JSON.stringify(req.params)}`)
    disc.serviceExists(req, res).then(data=>{
        const queryIndex = req.url.indexOf('?');
        const queryStr = queryIndex !== -1 ? req.url.substring(queryIndex) : '';
        const uri = data[0].serviceEndpoint + "/"+ req.params[0] +"/"+ req.params[1] + queryStr;
        console.log(uri)
        apihandler.apiGetHandler(uri)
            .then(response => {                
                res.status(200).json(response);
            })
            .catch(error => {      
                //console.log(error)          
                res.status(error.response.status).json(error.response.data);
                //res.status(500).json({"error":"test"})
            })
    }).catch(err=>{
        res.status(500).json(err);
    })         
}

exports.deleteProxy=(req, res, next) =>{
    disc.serviceExists(req, res).then(data=>{
        const queryIndex = req.url.indexOf('?');
        const queryStr = queryIndex !== -1 ? req.url.substring(queryIndex) : '';
        const uri = data[0].serviceEndpoint + "/"+ req.params[0] +"/"+ req.params[1] + queryStr;
        apihandler.apiDeleteHandler(uri)
            .then(response => {
                res.json(response)
            })
            .catch(error => {
                res.json(error)
            })
    }).catch(err=>{
        res.json(err)
    })         
}

exports.putProxy=(req, res, next) =>{    
    disc.serviceExists(req, res).then(data=>{
        const queryIndex = req.url.indexOf('?');
        const queryStr = queryIndex !== -1 ? req.url.substring(queryIndex) : '';
        const uri = data[0].serviceEndpoint + "/"+ req.params[0] +"/"+ req.params[1] + queryStr;    
        apihandler.apiPutHandler(uri, {...req.body})
            .then(response => {
                res.json(response)
            })
            .catch(error => {
                res.json(error)
            })
    }).catch(err=>{
        res.json(err)
    })        
}

exports.postProxy=(req, res, next) =>{        
    disc.serviceExists(req, res).then(data=>{
        const queryIndex = req.url.indexOf('?');
        const queryStr = queryIndex !== -1 ? req.url.substring(queryIndex) : '';
        const uri = data[0].serviceEndpoint + "/"+ req.params[0] +"/"+ req.params[1] + queryStr;        
        apihandler.apiPostHandler(uri, {...req.body})
            .then(response => {                
                res.json(response)
            })
            .catch(error => {
                res.json(error)
            })
    }).catch(err=>{
        res.json(err)
    })    
}