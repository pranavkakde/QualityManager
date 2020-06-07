var clientModel = require('../Model/client')
var config = require('../config/config')
var lib = require('../lib/common')
var bcrypt = require('bcrypt')
var jwt = require('jsonwebtoken')

var {validationResult } = require('express-validator')

function getAsciiPwd(password){
    return Buffer.from(password,'base64').toString('ascii')
}
function getBase64Pwd(password){
    return Buffer.from(password).toString('base64')
}

var isClient=(async(clientname, secretkey)=>{
    return new Promise(async(resolve, reject)=>{
        clientModel.setConfig(config.database)
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
 * @route GET /client/{clientname}
 * @param {string} clientname.path.required client name 
 * @headers {string} secretkey.required
 * @group Client Management Services
 * @operationId getClient
 * @produces application/json
 * @consumes application/json
 * @returns {Client.model} 200
 * @returns {Response.model} 422 - validation failed
 * @returns {Response.model} 406 - authorization failed 
 * @returns {Error.model}  500 - Unexpected error
 * @security JWT
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
 * @route DELETE /client/{clientname}
 * @param {string} clientname.path.required
 * @group Client Management Services
 * @operationId deleteClient
 * @produces application/json
 * @consumes application/json
 * @returns {Response.model} 200 - successful message
 * @returns {Response.model} 422 - validation failed
 * @returns {Response.model} 406 - authorization failed 
 * @returns {Error.model}  500 - Unexpected error
 * @security JWT
 */
exports.deleteClient=(req,res)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(422).json({ error: errors.array() });
        return;
    }
    var password = req.header('secretkey')
    isClient(req.params.clientname,password).then(data =>{
        clientModel.setConfig(config.database)
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
/**
 * @route PUT /client/{clientname}
 * @param {Client.model} client.body.required
 * @param {string} clientname.path.required
 * @group Client Management Services
 * @operationId updateClient
 * @produces application/json
 * @consumes application/json
 * @returns {Response.model} 200 - successful message
 * @returns {Response.model} 422 - validation failed
 * @returns {Response.model} 406 - authorization failed 
 * @returns {Error.model}  500 - Unexpected error
 * @security JWT
 */
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
                clientModel.setConfig(config.database)
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
/**
 * @route POST /client
 * @param {Client.model} client.body.required
 * @group Client Management Services
 * @operationId addClient
 * @produces application/json
 * @consumes application/json
 * @returns {Response.model} 201 - successful message
 * @returns {Error.model}  500 - Unexpected error
 * @security JWT
 */
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
    clientModel.setConfig(config.database)
    clientModel.insert({ClientName: req.body.clientname, SecretKey: encryptedSecretKey},(err,data)=>{
        if(err){
            res.status(500).json({error:"internal server error", err});
        }else{
            res.status(201).json({message: "Client record inserted succesfully"});
        }
    })
}

exports.getAllClients=(req,res)=>{
    clientModel.setConfig(config.database)
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
/**
 * @route POST /gettoken
 * @group Client Management Services
 * @param {Client.model} clientname.body.required
 * @operationId getToken
 * @produces application/json
 * @consumes application/json
 * @returns {token.model} 200 - successful message
 * @returns {tokenResponse.model} 422 - validation failed
 * @returns {tokenResponse.model} 406 - authorization failed 
 * @returns {Error.model}  500 - Unexpected error
 * @security JWT
 */
/*exports.gettoken=(req,res)=>{
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
  }*/
/**
 * @route POST /validatetoken
 * @group Client Management Services
 * @param {token.model} token.body.required
 * @operationId getToken
 * @produces application/json
 * @consumes application/json
 * @returns {tokenResponse.model} 200 - token is verified
 * @returns {tokenResponse.model} 400 - token not verified
 * @returns {tokenResponse.model} 406 - authorization failed 
 * @returns {Error.model}  500 - Unexpected error
 * @security JWT
 */
/*exports.validatetoken=(req,res)=>{
    var token = req.body.token
    var isverified = jwt.verify(token,Buffer.from('clientkey').toString('base64'))
    if (isverified){
        res.status(200).json({"success":"token is verified"})
    }else{
        res.status(400).json({"error":"Token not verified"})
    }
}*/
function checkSecretKey(reqseckey,dbseckey){
    return bcrypt.compareSync(reqseckey, dbseckey)
}