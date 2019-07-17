var userModel = require('../Model/user')
var config = require('../config/config')

userModel.setConfig(config)

exports.getUser=(req,res)=>{
    userModel.setConfig(config)
    userModel.find({UserId: req.params.userid},(err,data)=>{
        if(err){
            res.send(err);
        }else{
            res.send(data);
        }
    })
}

exports.deleteUser=(req,res)=>{
    userModel.delete({UserId: req.params.userid},(err,data)=>{
        if(err){
            res.send(err);
        }else{
            res.send({message: "User record deleted succesfully"});
        }
    })
}

exports.updateUser=(req,res)=>{
    userModel.update({UserId: req.body.userid},{UserName: req.body.username, Password: req.body.password, GroupId: req.body.groupid},(err,data)=>{
        if(err){
            res.send(err);
        }else{
            res.send({message: "User record updated succesfully"});
        }
    })
}

exports.addUser=(req,res)=>{
    userModel.insert({UserId: req.body.userid, UserName: req.body.username, Password: req.body.password, GroupId: req.body.groupid},(err,data)=>{
        if(err){
            res.send(err);
        }else{
            res.send({message: "User record inserted succesfully"});
        }
    })
}

exports.getAllUsers=(req,res)=>{
    userModel.setConfig(config)
    console.log("error here " + config)
    userModel.find({},function(err,data){
        console.log("got data " +data + err)
        if(err){
            res.json(err);
        }else{
            res.json(data);
        }
    })
}