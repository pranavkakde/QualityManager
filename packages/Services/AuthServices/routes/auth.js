var userModel = require('../models/user')
var config = require('../config/config')
var lib = require('../lib/common')
var bcrypt = require('bcrypt')
var {validationResult } = require('express-validator')
var jwt = require('jsonwebtoken')

function isUser(username, password){
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
                    if(checkSecretKey(password,data[0].Password)){
                        resolve(data)    
                    }else{
                        reject({error:"user name and password combination not found in database"})
                    }
                }
            }
        });
    })
}

function getAsciiPwd(password){
    return Buffer.from(password,'base64').toString('ascii')
}
function getBase64Pwd(password){
    return Buffer.from(password).toString('base64')
}
exports.gettoken=(req,res)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(422).json({ error: errors.array() });
        return;
    }
    //var password = getAsciiPwd(req.body.password)    
    isUser(req.body.username,req.body.password).then(data =>{                      
        var seckeydb = data[0].Password
        if(bcrypt.compareSync(req.body.password, seckeydb)){
            var user = {
                userid: data[0].UserId,
                username: data[0].UserName
            }            
            var token = jwt.sign(user,Buffer.from('clientkey').toString('base64'))            
                res.json({
                    token
                })
        }else{
            res.status(500).json({"errors":{"message": "password does not match"}})
        }
    }).catch(error=>{
        res.status(406).json(error);
    })    
  }

exports.validatetoken=(req,res)=>{
    var token = req.body.token
    var isverified = jwt.verify(token,Buffer.from(config.authkey.key).toString('base64'))
    if (isverified){
        res.status(200).json({"success":"token is verified"})
    }else{
        res.status(400).json({"error":"Token not verified"})
    }
}

function checkSecretKey(reqseckey,dbseckey){
    return bcrypt.compareSync(reqseckey, dbseckey)
}