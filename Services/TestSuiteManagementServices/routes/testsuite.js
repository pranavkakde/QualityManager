var suiteModel = require('../Model/testsuite')
var config = require('../config/config')
var lib = require('../lib/common')
var {validationResult } = require('express-validator')

exports.getSuite= (req,res)=>{
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json({ error: errors.array() });
            return;
        }
        suiteModel.setConfig(config)
        isSuite(req.params.testsuiteid).then(data=>{
            res.status(200).json(data);
        }).catch(error=>{
            res.status(400).json(error);
        })
    }catch(err){
        res.status(500).json({error: "internal server error", err});
    }
}
exports.deleteSuite=(req,res)=>{
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json({ error: errors.array() });
            return;
        }
        suiteModel.setConfig(config)
        suiteModel.delete({testsuiteid: req.params.testsuiteid},(err,data)=>{
            if(err){
                if(lib.isEmptyObject(err)){
                    res.status(400).json({error: `testsuiteid details not found for ${req.params.testsuiteid}`});
                }else{
                    res.status(500).json({error:"internal server error", err});
                }
            }else{
                res.status(200).json({message: "TestSuite record deleted succesfully", data});
            }
        })
    }catch(err){
        res.status(500).json({error: "internal server error", err});
    }
}
exports.updateSuite=(req,res)=>{
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json({ error: errors.array() });
            return;
        }
        suiteModel.setConfig(config)
        isSuite(req.params.testsuiteid).then(data =>{
            suiteModel.update({testsuiteid: req.params.testsuiteid},{name: req.body.name, description: req.body.description, 
                statusid: req.body.statusid, releaseid: req.body.releaseid
            },(err,data)=>{
                if(err){
                    if(lib.isEmptyObject(err)){
                        res.status(400).json({error:`TestSuite details not found for ${req.params.testsuiteid}`});
                    }else{
                        res.status(500).json({error:"internal server error", err});
                    }
                }else{
                    res.status(200).json({message: "TestSuite record updated succesfully", data});
                }
            })
        }).catch(error=>{
            res.status(406).json(error);
        })
    }catch(err){
        res.status(500).json({error:"internal server error", err});
    }
}
exports.addSuite=(req,res)=>{
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json({ error: errors.array() });
            return;
        }
        suiteModel.setConfig(config)
        suiteModel.insert({name: req.body.name, description: req.body.description, 
            statusid: req.body.statusid, releaseid: req.body.releaseid
        },(err,data)=>{
            if(err){
                    res.status(500).json({error:"internal server error", err});
            }else{
                res.status(201).json({message: "TestSuite record inserted succesfully", data});
            }
        })
    }catch(err){
        res.status(500).json({error:"internal server error", err});
    }
}
function isSuite(testsuiteid){
    return new Promise((resolve, reject)=>{
        suiteModel.setConfig(config)
        suiteModel.find({testsuiteid: testsuiteid}, (err,data)=>{
            if(err){
                if(lib.isEmptyObject(err)){
                    reject({error:"testsuiteid id is not found in database"})
                }else{
                    reject({error:"internal server error", err})
                }
            }else{
                if(lib.isEmptyObject(data)){
                    reject({error:"testsuiteid id is not found in database"})
                }else{
                    resolve(data)    
                }
            }
        });
    })
}
exports.getTestCases=(req,res)=>{
    res.status(200).json({"message":"This service is still in progress. This will be completed once CRUD on Test Case Service is complete."})
}