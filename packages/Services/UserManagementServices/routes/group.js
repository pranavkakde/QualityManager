var groupModel = require('../Model/group')
var config = require('../config/config')
var {validationResult } = require('express-validator')
var lib = require('../lib/common')
groupModel.setConfig(config)

exports.getGroup=(req,res)=>{
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json({ error: errors.array() });
            return;
        }
        groupModel.find({GroupId: req.params.groupid},(err,data)=>{
            if(err){
                if(lib.isEmptyObject(err)){
                    res.status(400).json({error: `Group details not found for ${req.params.groupid}`});
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
 
exports.deleteGroup=(req,res)=>{
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json({ error: errors.array() });
            return;
        }
        groupModel.delete({GroupId: req.params.groupid},(err,data)=>{
            if(err){
                if(lib.isEmptyObject(err)){
                    res.status(400).json({error: `Group details not found for ${req.params.groupid}`});
                }else{
                    res.status(500).json({error: "internal server error", err});
                }
            }else{
                res.status(200).json({message: "Group record deleted succesfully"});
            }
        })
    }catch(err){
        res.status(500).json({error: "internal server error", err});
    }
}

exports.updateGroup=(req,res)=>{
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json({ error: errors.array() });
            return;
        }
        groupModel.update({GroupId: req.params.groupid},{GroupName: req.body.groupname, IsAdmin: req.body.isadmin},(err,data)=>{
            if(err){
                if(lib.isEmptyObject(err)){
                    res.status(400).json({error: `Group details not found for ${req.params.groupid}`});
                }else{
                    res.status(500).json({error: "internal server error", err});
                }
            }else{
                res.status(200).json({message: "Group record updated succesfully"});
            }
        })
    }catch(err){
        res.status(500).json({error: "internal server error", err});
    }
}

exports.addGroup=(req,res)=>{
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json({ error: errors.array() });
            return;
        }
        groupModel.insert({GroupName: req.body.groupname, IsAdmin: req.body.isadmin},(err,data)=>{
            if(err){
                if(lib.isEmptyObject(err)){
                    res.status(400).json({error: "error in inserting group data"});
                }else{
                    res.status(500).json({error: "internal server error", err});
                }
            }else{
                res.status(201).json({message: "Group record inserted succesfully"});
            }
        })
    }catch(err){
        res.status(500).json({error: "internal server error", err});
    }
}

exports.getAllGroups=(req,res)=>{
    groupModel.find({},(err,data)=>{
        if(err){
            res.status(400).json(err);
        }else{
            res.status(200).json(data);
        }
    })
}
//check if user belongs to admin group
exports.isAdmin=(groupid)=>{
    return new Promise(async(resolve, reject)=>{
        groupModel.find({GroupId:groupid},(err,data)=>{
            if(err){
                res.status(400).json({"error": err})
            }else{
                if(data[0].IsAdmin===true){
                    resolve(true)
                }else{
                    reject(false)
                }
            }
        })
    })
}