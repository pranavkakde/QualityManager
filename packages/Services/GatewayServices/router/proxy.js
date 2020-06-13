var apihandler=require('./router');
var disc = require('./servicedisc');

exports.getProxy=(req,res)=>{    
    disc.serviceExists(req, res).then(data=>{
        const uri = data[0].serviceEndpoint + "/"+ req.params.servicename +"/"+ req.params.path;        
        apihandler.apiGetHandler(uri)
            .then(response => {
                console.log(response)
                res.json(response)
            })
            .catch(error => {
                res.json(error)
            })
    }).catch(err=>{
        res.json(err)
    })         
}

exports.deleteProxy=(req,res)=>{
    disc.serviceExists(req, res).then(data=>{
        const uri = data[0].serviceEndpoint + "/"+ req.params.servicename +"/"+ req.params.path;        
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

exports.putProxy=(req,res)=>{    
    disc.serviceExists(req, res).then(data=>{
        const uri = data[0].serviceEndpoint + "/"+ req.params.servicename +"/"+ req.params.path;    
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

exports.postProxy=(req,res)=>{    
    disc.serviceExists(req, res).then(data=>{
        const uri = data[0].serviceEndpoint + "/"+ req.params.servicename +"/"+ req.params.path;        
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