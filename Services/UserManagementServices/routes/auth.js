var groupRoute = require('./group')
var userModel = require('../Model/user')
var config = require('../config/config')

exports.checkRequiredRole=(req,res,next)=>{
    if(req){
        if(!req.path.indexOf('login')){
            if(req.body.username){
                userModel.setConfig(config)
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
    groupRoute.isAdmin(groupid).then(data=>{
        next()
    }).catch(err=>{
        res.status(400).json({"error": err})
    })
}
exports.checkLogin=(req, res, next)=>{
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
}