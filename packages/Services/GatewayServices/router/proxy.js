var apihandler=require('./router');
var disc = require('./servicedisc');

exports.getProxy=(req,res)=>{
    console.log(`${JSON.stringify(req.params)}`)
    disc.serviceExists(req, res).then(data=>{
        const uri = data[0].serviceEndpoint + "/"+ req.params[0] +"/"+ req.params[1];
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

exports.deleteProxy=(req,res)=>{
    disc.serviceExists(req, res).then(data=>{
        const uri = data[0].serviceEndpoint + "/"+ req.params[0] +"/"+ req.params[1];
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
        const uri = data[0].serviceEndpoint + "/"+ req.params[0] +"/"+ req.params[1];    
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
        const uri = data[0].serviceEndpoint + "/"+ req.params[0] +"/"+ req.params[1];        
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