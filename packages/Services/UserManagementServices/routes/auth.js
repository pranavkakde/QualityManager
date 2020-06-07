var groupRoute = require('./group')
var userModel = require('../Model/user')
var config = require('../config/config')
var request = require('superagent')
//var request = require('../lib/superWrapper')

exports.checkRequiredRole=(req,res,next)=>{
    if(req){
        if(!req.path.indexOf('login')){
            if(req.body.username){
                userModel.setConfig(config.database)
                userModel.find({UserName: req.body.username},(err,data)=>{
                    if(err){
                        if(lib.isEmptyObject(err)){
                            res.status(400).json({error: `user details not found for ${req.body.username}`});
                        }else{
                            res.status(500).json({error: "internal server error", err});
                        }
                    }else{
                        getRole(data[0].GroupId,next)
                    }
                })
                
            }else if(req.params.username){
                userModel.find({UserName: req.params.username},(err,data)=>{
                    if(err){
                        if(lib.isEmptyObject(err)){
                            res.status(400).json({error: `user details not found for ${req.params.username}`});
                        }else{
                            res.status(500).json({error: "internal server error", err});
                        }
                    }else{
                        getRole(data[0].GroupId,next)
                    }
                })
            }else{
                res.status(400).json({error: "user name not sent in parameter or body"});
            }
        }else{
            next()
        }
    }
}
function getRole(groupid,next){
    //checkes only for admin vs normal user. Multiple roles to be added later
    groupRoute.isAdmin(groupid).then(data=>{
        next()
    }).catch(err=>{
        res.status(400).json({"error": err})
    });
}
/*exports.checkLogin=(req, res, next)=>{
    if(req){
        if(req.path.indexOf('login')<0){
            if (req.session && req.session.userid) {
                next();
            }else{
                res.status(401).json({"error": "please login to continue"})
            }
        }else{
            next();
        }
    }
}*/
exports.checkAuthToken= async(req,res,next)=>{
    if(req){
        if(req.path.indexOf('login')<0){
            const url = `${config.services.auth_services}validatetoken`
            const tokenHeader = req.header('Authorization')            
            if(tokenHeader){
                var token = tokenHeader.split(" ")[1]                    
                var body = {"token": token }                
                request
                    .post(url)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .set('Accept', 'application/json')                    
                    .then(resp=>{
                        //res.status(200).json(resp.body);
                        next();
                    }).catch(err=>{
                        res.status(401).json({"error": "Invalid Login Credentials", err});
                    })
            }else{
                res.status(403).json({"error":"Token required", err});
            }
        }
    }else{
        res.status(500).json({"error": "Missing Request", err});
    }
}