var clientModel = require('../Model/client')
var config = require('../config/config')
var lib = require('../lib/common')
var bcrypt = require('bcrypt')
var jwt = require('jsonwebtoken')

var { check, param, query, cookies, header, body, validationResult } = require('express-validator')

function getAsciiPwd(password){
    return Buffer.from(password,'base64').toString('ascii')
}
function getBase64Pwd(password){
    return Buffer.from(password).toString('base64')
}

var isClient=(async(clientname, secretkey)=>{
    return new Promise(async(resolve, reject)=>{
        clientModel.setConfig(config)
        await clientModel.find({ClientName: clientname}, (err,data)=>{
            if(err){
                if(lib.isEmptyObject(err)){
                    reject({error:"client name and secret key combination not found in database"})
                }else{
                    reject({error:"internal server error", err})
                }
            }else{
                if(lib.isEmptyObject(data)){
                    reject({error:"client name and secret key combination not found in database"})
                }else{
                    if(checkSecretKey(secretkey,data[0].Secretkey)){
                        resolve(data)    
                    }else{
                        reject({error:"client name and secret key combination not found in database"})
                    }
                }                
            }                    
        });
    })
})
/**
 * This function comment is parsed by doctrine
 * @route GET /client/:clientname
 * @group client - Operations about client
 * @returns {object} 200 - An array of client info
 * @returns {Error}  default - Unexpected error
 */
exports.getClient=(req,res)=>{
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json({ error: errors.array() });
            return;
        }
        var password = req.header('secretkey')
        isClient(req.params.clientname,password).then(data =>{
            res.status(200).json(data);
        }).catch(error=>{
            res.status(406).json(error);
        })
    }catch(err){
        res.status(500).json(err)
    }
}
/**
 * This function comment is parsed by doctrine
 * @route DELETE /client/:clientname
 * @group client - Operations about client
 * @returns {object} 200 - An array of client info
 * @returns {Error}  default - Unexpected error
 */
exports.deleteClient=(req,res)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(422).json({ error: errors.array() });
        return;
    }
    var password = req.header('secretkey')
    isClient(req.params.clientname,password).then(data =>{
        clientModel.setConfig(config)
        clientModel.delete({ClientName: req.params.clientname},(err,data)=>{
            if(err){
                if(lib.isEmptyObject(err)){
                    res.status(422).json({error:"no data found"});
                }else{
                    res.status(500).json({error:"internal server error", err});
                }
            }else{
                res.status(200).json({message: "client record deleted succesfully"});
            }
        })
    }).catch(error=>{
        res.status(406).json(error);
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
        var password = req.header('secretkey')
        isClient(req.params.clientname,password).then(data =>{                
                clientModel.setConfig(config)
                clientModel.update({ClientId: data[0].ClientId},{ClientName: req.params.clientname, SecretKey: encryptedSecretKey },(err,data)=>{
                    if(err){
                        if(lib.isEmptyObject(err)){
                            res.status(500).json({error:"no data found"});
                        }else{
                            res.status(500).json({error:"internal server error", err});
                        }
                    }else{
                        res.status(200).json({message: "client record updated succesfully"});
                    }
                })
        }).catch(error=>{
            res.status(406).json(error);
        })
    }catch(err){
        res.status(500).jsonp(err)
    }
}

exports.addClient=(req,res)=>{
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
    clientModel.insert({ClientName: req.body.clientname, SecretKey: encryptedSecretKey},(err,data)=>{
        if(err){
            res.status(500).json({error:"internal server error", err});
        }else{
            res.status(201).json({message: "Client record inserted succesfully"});
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
    var password = req.header('secretkey')
    isClient(req.body.clientname,password).then(data =>{                
        var seckeydb = data[0].Secretkey
        if(bcrypt.compareSync(password, seckeydb)){
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
    }).catch(error=>{
        res.status(406).json(error);
    })    
  }

exports.validatetoken=(req,res)=>{
    var token = req.body.token
    var isverified = jwt.verify(token,Buffer.from('clientkey').toString('base64'))
    if (isverified){
        res.status(200).json({"success":"token is verified"})
    }else{
        res.status(400).json({"error":"Token not verified"})
    }
}
function checkSecretKey(reqseckey,dbseckey){
    return bcrypt.compareSync(reqseckey, dbseckey)
}