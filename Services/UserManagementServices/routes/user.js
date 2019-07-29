var userModel = require('../Model/user')
var config = require('../config/config')
var lib = require('../lib/common')
var bcrypt = require('bcrypt')
var { param, query, cookies, header, body, validationResult } = require('express-validator/check')

exports.getUser= async (req,res, next)=>{
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json({ error: errors.array() });
            return;
        }
        userModel.setConfig(config)
        userModel.find({UserId: req.params.userid},(err,data)=>{
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
    }catch(err){
        return next(err)
    }
}

exports.deleteUser=(req,res)=>{
    userModel.delete({UserId: req.params.userid},(err,data)=>{
        if(err){
            if(lib.isEmptyObject(err)){
                res.status(500).json({error:"no data found"});
            }else{
                res.status(500).json({error:"internal server error", err});
            }
        }else{
            res.status(200).json({message: "User record deleted succesfully"});
        }
    })
}

exports.updateUser=(req,res)=>{
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json({ error: errors.array() });
            return;
        }
        userModel.setConfig(config)
        userModel.update({UserId: req.params.userid},{UserName: req.body.UserName, Password: req.body.Password, GroupId: req.body.GroupId},(err,data)=>{
            if(err){
                if(lib.isEmptyObject(err)){
                    res.status(500).json({error:"no data found"});
                }else{
                    res.status(500).json({error:"internal server error", err});
                }
            }else{
                res.status(201).json({message: "User record updated succesfully"});
            }
        })
    }catch(err){
        return next(err)
    }
}

exports.addUser=(req,res)=>{
    var encryptedPassword;
    bcrypt.hash(req.body.Password, 10, function(err, hash) {
        if (err){
            res.status(400).json({error: "password encrypytion failed"} )
        }
        encryptedPassword = hash
    });
    userModel.insert({UserName: req.body.UserName, Password: encryptedPassword, GroupId: req.body.GroupId},(err,data)=>{
        if(err){
                res.status(500).json({error:"internal server error", err});
        }else{
            res.status(200).json({message: "User record inserted succesfully"});
        }
    })
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