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
exports.isUser=(async(username, secretkey)=>{
    return new Promise(async(resolve, reject)=>{
        userModel.setConfig(config)
        await userModel.find({UserName: username}, (err,data)=>{
            if(err){
                if(lib.isEmptyObject(err)){
                    reject({error:"user name and password combination not found in database"})
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
})
exports.getUser= (req,res)=>{
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json({ error: errors.array() });
            return;
        }
        userModel.setConfig(config)
        userModel.find({UserName: req.params.username},(err,data)=>{
            if(err){
                if(lib.isEmptyObject(err)){
                    res.status(400).json({error: `user details not found for ${req.params.username}`});
                }else{
                    res.status(500).json({error: "internal server error", err});
                }
            }else{
                res.status(200).json(data);
            }
        })
    }catch(err){
        res.status(500).json({error: "internal server error", err});
    }
}
exports.deleteUser=(req,res)=>{
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json({ error: errors.array() });
            return;
        }
        userModel.setConfig(config)
        userModel.delete({UserName: req.params.username},(err,data)=>{
            if(err){
                if(lib.isEmptyObject(err)){
                    res.status(400).json({error: `user details not found for ${req.params.username}`});
                }else{
                    res.status(500).json({error:"internal server error", err});
                }
            }else{
                res.status(200).json({message: "User record deleted succesfully"});
            }
        })
    }catch(err){
        res.status(500).json({error: "internal server error", err});
    }
}
exports.updateUser=(req,res)=>{
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json({ error: errors.array() });
            return;
        }
        userModel.setConfig(config)
        var password = getAsciiPwd(req.body.password)
        var encryptedSecretKey = bcrypt.hashSync(password, 10, function(err, hash) {
            if (err){
                return ({error: "secretkey encrypytion failed"})
            }
        });
        isUser(req.params.clientname,encryptedSecretKey).then(data =>{
            userModel.update({UserName: req.params.username},{UserName: req.body.UserName, Password: encryptedSecretKey, GroupId: req.body.GroupId},(err,data)=>{
                if(err){
                    if(lib.isEmptyObject(err)){
                        res.status(400).json({error:`User details not found for ${req.params.username}`});
                    }else{
                        res.status(500).json({error:"internal server error", err});
                    }
                }else{
                    res.status(200).json({message: "User record updated succesfully"});
                }
            })
        }).catch(error=>{
            res.status(406).json(error);
        })
    }catch(err){
        res.status(500).json({error:"internal server error", err});
    }
}
exports.addUser=(req,res)=>{
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json({ error: errors.array() });
            return;
        }
        var password = getAsciiPwd(req.body.password)
        var encryptedPassword = bcrypt.hashSync(password, 10, function(err, hash) {
            if (err){
                return ({error: "secretkey encrypytion failed"})
            }
        });
        userModel.insert({UserName: req.body.UserName, Password: encryptedPassword, GroupId: req.body.GroupId},(err,data)=>{
            if(err){
                    res.status(500).json({error:"internal server error", err});
            }else{
                res.status(201).json({message: "User record inserted succesfully"});
            }
        })
    }catch(err){
        res.status(500).json({error:"internal server error", err});
    }
}
exports.getAllUsers=(req,res)=>{
    userModel.setConfig(config)
    userModel.find({},function(err,data){
        if(err){
            if(lib.isEmptyObject(err)){
                res.status(500).json({error:"no data found"});
            }else{
                res.status(500).json({error:"internal server error", err});
            }
        }else{
            res.status(200).json(data);
        }
    })
}
function checkSecretKey(reqseckey,dbseckey){
    return bcrypt.compareSync(reqseckey, dbseckey)
}
exports.login=(req,res)=>{
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json({ error: errors.array() });
            return;
        }
        userModel.setConfig(config)
        var password = getAsciiPwd(req.body.password)
        isClient(req.params.clientname,password).then(data =>{
            req.session.userid = data[0].userid;
            res.status(200).json(data[0]);
        }).catch(error=>{
            res.status(406).json(error);
        })
    }catch(err){
        res.status(500).json({error: "internal server error", err});
    }
}
exports.logout=(req,res,next)=>{
    if (req.session) {
        req.session.destroy(function(err) {
            if(err) {
                return next(err);
            }else {
                return res.status(200).json({"message":"logout successful"})
            }
        });
    }
}
