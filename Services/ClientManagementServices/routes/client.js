var clientModel = require('../Model/client')
var config = require('../config/config')
var lib = require('../lib/common')
var bcrypt = require('bcrypt')
var jwt = require('jsonwebtoken')
var { check, param, query, cookies, header, body, validationResult } = require('express-validator')

exports.getClient=(req,res)=>{
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json({ error: errors.array() });
            return;
        }
        clientModel.setConfig(config)
        clientModel.find({ClientId: req.params.clientid},(err,data)=>{
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
        res.status(500).json(err)
    }
}

exports.deleteClient=(req,res)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(422).json({ error: errors.array() });
        return;
    }
    clientModel.setConfig(config)
    clientModel.delete({ClientId: req.params.clientid},(err,data)=>{
        if(err){
            if(lib.isEmptyObject(err)){
                res.status(500).json({error:"no data found"});
            }else{
                res.status(500).json({error:"internal server error", err});
            }
        }else{
            res.status(200).json({message: "client record deleted succesfully"});
        }
    })
}

exports.updateClient=(req,res)=>{
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json({ error: errors.array() });
            return;
        }
        var encryptedSecretKey = bcrypt.hashSync(req.body.secretkey, 10, function(err, hash) {
            if (err){
                return ({error: "secretkey encrypytion failed"})
            }
        });
        clientModel.setConfig(config)
        clientModel.update({ClientId: req.params.clientid},{ClientName: req.body.clientname, SecretKey: encryptedSecretKey },(err,data)=>{
            if(err){
                if(lib.isEmptyObject(err)){
                    res.status(500).json({error:"no data found"});
                }else{
                    res.status(500).json({error:"internal server error", err});
                }
            }else{
                res.status(201).json({message: "client record updated succesfully"});
            }
        })
    }catch(err){
        return next(err)
    }
}

exports.addClient=(req,res)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(422).json({ error: errors.array() });
        return;
    }
    clientModel.setConfig(config)
    var encryptedSecretKey = bcrypt.hashSync(req.body.secretkey, 10, function(err, hash) {
        if (err){
            return ({error: "secretkey encrypytion failed"})
        }
    });
    clientModel.insert({ClientName: req.body.ClientName, SecretKey: encryptedSecretKey},(err,data)=>{
        if(err){
                res.status(500).json({error:"internal server error", err});
        }else{
            res.status(200).json({message: "Client record inserted succesfully"});
        }
    })
}

exports.getAllClients=(req,res)=>{
    clientModel.setConfig(config)
    clientModel.find({},function(err,data){
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

exports.gettoken=(req,res)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(422).json({ error: errors.array() });
        return;
    }
    clientModel.setConfig(config)
    clientModel.find({ClientId: req.body.clientid, ClientName: req.body.clientname },function(err,data){
        if(err){
            if(lib.isEmptyObject(err)){
                res.status(500).json({error:"could not find data for client id and client name combination"});
            }else{
                res.status(500).json({error:"internal server error", err});
            }
        }else{
            var seckeydb = data[0].Secretkey
            if(bcrypt.compareSync(req.body.secretkey, seckeydb)){
                var user = {
                    clientid: data[0].ClientId,
                    clientname: data[0].ClientName
                }
                var token = jwt.sign(user,Buffer.from('clientkey').toString('base64'))   
                    res.json({
                        token
                    })
            }else{
                res.status(500).json({"errors":{"message": "secretekey does not match"}})
            }
        }
    })
  }

exports.validatetoken=(req,res)=>{
    var token = req.body.token
    jwt.verify(token,Buffer.from('clientkey').toString('base64'))?res.status(200):res.status(400).json({"error":"Token not verified"})
}