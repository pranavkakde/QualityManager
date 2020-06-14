var config = require('../config')
var axios = require('axios');

exports.checkAuthToken= async(req,res,next)=>{
    if(req){        
        if(req.path.indexOf('token')<0 && req.path.indexOf('services')<0){
            const url = `${config.services.auth_services}auth/validatetoken`
            const tokenHeader = req.header('Authorization')            
            if(tokenHeader){
                var token = tokenHeader.split(" ")[1]                
                if(token===undefined){
                    res.status(403).json({"error":"Missing Token", err});
                }
                var body = {"token": token }                
                axios.post(url, {...body})
                    .then(resp=>{                        
                        next();
                    }).catch(err=>{
                        res.status(401).json({"error": "Invalid Login Credentials"});
                    })
            }else{
                res.status(403).json({"error":"Missing Authorization Header"});
            }
        }else{
            next();
        }
    }else{
        res.status(500).json({"error": "Missing Request" });
    }
}