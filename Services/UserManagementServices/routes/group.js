var groupModel = require('../Model/group')
var config = require('../config/config')

groupModel.setConfig(config)

exports.getGroup=(req,res)=>{
    groupModel.find({GroupId: req.params.groupid},(err,data)=>{
        if(err){
            res.send(err);
        }else{
            res.send(data);
        }
    })
}

exports.deleteGroup=(req,res)=>{
    groupModel.delete({GroupId: req.params.groupid},(err,data)=>{
        if(err){
            res.send(err);
        }else{
            res.send({message: "Group record deleted succesfully"});
        }
    })
}

exports.updateGroup=(req,res)=>{
    groupModel.update({GroupId: req.body.groupid},{GroupName: req.body.groupname},(err,data)=>{
        if(err){
            res.send(err);
        }else{
            res.send({message: "Group record updated succesfully"});
        }
    })
}

exports.addGroup=(req,res)=>{
    groupModel.insert({GroupId: req.body.groupid, GroupName: req.body.groupname},(err,data)=>{
        if(err){
            res.send(err);
        }else{
            res.send({message: "Group record inserted succesfully"});
        }
    })
}

exports.getAllGroups=(req,res)=>{
    groupModel.find({},(err,data)=>{
        if(err){
            res.send(err);
        }else{
            res.send(data);
        }
    })
}