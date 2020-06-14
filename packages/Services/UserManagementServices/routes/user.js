var userModel = require('../Model/user')
var config = require('../config/config')
var lib = require('../lib/common')
var bcrypt = require('bcrypt')
var {validationResult } = require('express-validator')

function getAsciiPwd(password){
    return Buffer.from(password,'base64').toString('ascii')
}
function getBase64Pwd(password){
    return Buffer.from(password).toString('base64')
}
function isUser(username, secretkey){
    return new Promise((resolve, reject)=>{
        userModel.setConfig(config.database)
        userModel.find({UserName: username}, (err,data)=>{
            if(err){
                if(lib.isEmptyObject(err)){
                    reject({error:"user name not found in database"})
                }else{
                    reject({error:"internal server error", err})
                }
            }else{
                if(lib.isEmptyObject(data)){
                    reject({error:"user name and password combination not found in database"})
                }else{
                    if(checkSecretKey(secretkey,data[0].Password)){
                        resolve(data)    
                    }else{
                        reject({error:"user name and password combination not found in database"})
                    }
                }
            }
        });
    })
}
exports.getUser= (req,res)=>{
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            next(lib.error(422,errors.array()));
            //return;
        }
        userModel.setConfig(config.database)
        userModel.find({UserName: req.params.username},(err,data)=>{
            if(err){
                if(lib.isEmptyObject(err)){
                    next(lib.error(404,`user details not found for ${req.params.username}`));
                }else{
                    next(lib.error(500,`internal server error ${err}`));
                }
            }else{
                res.status(200).json(data);
            }
        })
    }catch(err){
        next(lib.error(500,`internal server error ${err}`));
    }
}
exports.deleteUser=(req,res)=>{
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            next(lib.error(422,errors.array()));
            return;
        }
        userModel.setConfig(config.database)
        userModel.delete({UserName: req.params.username},(err,data)=>{
            if(err){
                if(lib.isEmptyObject(err)){
                    next(lib.error(404,`user details not found for ${req.params.username}`));
                }else{
                    next(lib.error(500,`internal server error ${err}`));
                }
            }else{
                res.status(204).json({success: "User record deleted succesfully"});
            }
        })
    }catch(err){
        next(lib.error(500,`internal server error ${err}`));
    }
}
exports.updateUser=(req,res)=>{
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            next(lib.error(422,errors.array()));
            return;
        }
        userModel.setConfig(config.database)
        var password = getAsciiPwd(req.body.password)
        var encryptedSecretKey = bcrypt.hashSync(password, 10, function(err, hash) {
            if (err){
                return ({error: "secretkey encrypytion failed"})
            }
        });
        isUser(req.params.username,encryptedSecretKey).then(data =>{
            userModel.update({UserName: req.params.username},{UserName: req.body.UserName, Password: encryptedSecretKey, GroupId: req.body.groupid},(err,data)=>{
                if(err){
                    if(lib.isEmptyObject(err)){
                        next(lib.error(404,`user details not found for ${req.params.username}`));
                    }else{
                        next(lib.error(500,`internal server error ${err}`));
                    }
                }else{
                    res.status(200).json({success: "User record updated succesfully"});
                }
            })
        }).catch(error=>{
            next(lib.error(404,`Not found`));
        })
    }catch(err){
        next(lib.error(500,`internal server error ${err}`));
    }
}
exports.addUser=(req,res)=>{
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            next(lib.error(422,errors.array()));
            return;
        }
        //var password = getAsciiPwd(req.body.password)
        var password = req.body.password
        var encryptedPassword = bcrypt.hashSync(password, 10, function(err, hash) {
            if (err){
                return ({error: "secretkey encrypytion failed"})
            }
        });        
        userModel.insert({UserName: req.body.username, Password: encryptedPassword, GroupId: req.body.groupid},(err,data)=>{
            if(err){
                    next(lib.error(500,`internal server error ${err}`));
            }else{
                res.status(201).json({success: "User record inserted succesfully"});
            }
        })
    }catch(err){
        next(lib.error(500,`internal server error ${err}`));
    }
}
exports.getAllUsers=(req,res)=>{    
    userModel.setConfig(config.database)
    userModel.find({},function(err,data){
        if(err){
            if(lib.isEmptyObject(err)){
                res.status(404).json({error:"no data found"});
            }else{
                next(lib.error(500,`internal server error ${err}`));
            }
        }else{
            res.status(200).json(data);
        }
    })
}
function checkSecretKey(reqseckey,dbseckey){
    return bcrypt.compareSync(reqseckey, dbseckey)
}
/*exports.login=(req,res)=>{
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            next(lib.error(422,errors.array()));
            return;
        }
        userModel.setConfig(config.database)
        var password = getAsciiPwd(req.body.password)
        //checkSecretKey(req.body.password,)
        isUser(req.body.username,password).then(data =>{
            req.session.userid = data[0].UserId;
            res.status(200).json({"data":data[0]});
        }).catch(error=>{
            next(lib.error(404,`Not found`));
        })
    }catch(err){
        next(lib.error(500,`internal server error ${err}`));
    }
}
exports.logout=(req,res)=>{
    if (req.session) {
        destroySession(req.session).then(data=>{
            res.status(200).json({"success":"logout successful"})
        }).catch(err=>{
            res.status(500).json({"error":"internal server error", err})
        })
    }else{
        return res.status(403).json({"error":"user is not logged in"})
    }
}

function destroySession(session){
    return new Promise((resolve, reject)=>{
        session.destroy(function(err) {
            if(err) {
                reject("error in deleting session")
            }else {
                resolve("done")
            }
        });
    })
}
*/