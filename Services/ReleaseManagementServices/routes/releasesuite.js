var caseModel = require('../Model/releasesuite')
var config = require('../config/config')
var lib = require('../lib/common')
var {validationResult } = require('express-validator')

exports.getCase= (req,res)=>{
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json({ error: errors.array() });
            return;
        }
        caseModel.setConfig(config)
        isRel(req.params.releaseid).then(data=>{
            res.status(200).json(data);
        }).catch(error=>{
            res.status(400).json(error);
        })
    }catch(err){
        res.status(500).json({error: "internal server error", err});
    }
}
exports.deleteCase=(req,res)=>{
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json({ error: errors.array() });
            return;
        }
        caseModel.setConfig(config)
        caseModel.delete({testsuiteid: req.params.testsuiteid, releaseid: req.params.releaseid },(err,data)=>{
            if(err){
                if(lib.isEmptyObject(err)){
                    res.status(400).json({error: `Release and associated Test Suite details not found for ${req.params.releaseid}`});
                }else{
                    res.status(500).json({error:"internal server error", err});
                }
            }else{
                res.status(200).json({message: "Release and associated Test Suite record deleted succesfully", data});
            }
        })
    }catch(err){
        res.status(500).json({error: "internal server error", err});
    }
}
exports.updateCase=(req,res)=>{
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json({ error: errors.array() });
            return;
        }
        caseModel.setConfig(config)
        isCase(req.params.releasesuiteid).then(data =>{
            caseModel.update({id: req.params.releasesuiteid},{testsuiteid: req.body.testsuiteid, releaseid: req.body.releaseid
            },(err,data)=>{
                if(err){
                    if(lib.isEmptyObject(err)){
                        res.status(400).json({error:`Release and associated Test Suite id details not found for ${req.params.releaseid}`});
                    }else{
                        res.status(500).json({error:"internal server error", err});
                    }
                }else{
                    res.status(200).json({message: "Release and associated Test Suite record updated succesfully", data});
                }
            })
        }).catch(error=>{
            res.status(400).json(error);
        })
    }catch(err){
        res.status(500).json({error:"internal server error", err});
    }
}
exports.addCase=(req,res)=>{
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json({ error: errors.array() });
            return;
        }
        caseModel.setConfig(config)
        caseModel.insert({testsuiteid: req.params.testsuiteid, releaseid: req.params.releaseid
        },(err,data)=>{
            if(err){
                    res.status(500).json({error:"internal server error", err});
            }else{
                res.status(201).json({message: "Release and Test Suite record inserted succesfully", data});
            }
        })
    }catch(err){
        res.status(500).json({error:"internal server error", err});
    }
}
function isRel(releaseid, testsuiteid){
    return new Promise((resolve, reject)=>{
        caseModel.setConfig(config)
        //rewrite this to get release id and test suite id by calling GET Test suite by id service. 
        caseModel.find({releaseid: testsuiteid, testcaseid: testcaseid}, (err,data)=>{
            if(err){
                if(lib.isEmptyObject(err)){
                    reject({error:"test suite id and associated test case is not found in database"})
                }else{
                    reject({error:"internal server error", err})
                }
            }else{
                if(lib.isEmptyObject(data)){
                    reject({error:"test suite id and associated test case is not found in database"})
                }else{
                    resolve(data)    
                }
            }
        });
    })
}
function isCase(releasesuiteid){
    return new Promise((resolve, reject)=>{
        caseModel.setConfig(config)
        caseModel.find({id: releasesuiteid}, (err,data)=>{
            if(err){
                if(lib.isEmptyObject(err)){
                    reject({error:"Release Id and Test Sutie association is not found in database"})
                }else{
                    reject({error:"internal server error", err})
                }
            }else{
                if(lib.isEmptyObject(data)){
                    reject({error:"Release Id and Test Sutie association is not found in database"})
                }else{
                    resolve(data)    
                }
            }
        });
    })
}
