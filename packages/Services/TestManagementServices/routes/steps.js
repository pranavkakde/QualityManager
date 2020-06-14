var stepModel = require('../Model/steps')
var config = require('../config/config')
var lib = require('../lib/common')
var {validationResult } = require('express-validator')

exports.getTestStep= (req,res)=>{
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            next(lib.error(422,errors.array()));
            return;
        }
        stepModel.setConfig(config.database)
        isTestStep(req.params.testcaseid,req.params.stepid).then(data=>{
            res.status(200).json(data);
        }).catch(error=>{
            next(lib.error(404,"No data found"));
        })
    }catch(err){
        next(lib.error(500,`internal server error ${err}`));
    }
}
exports.deleteTestStep=(req,res)=>{
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            next(lib.error(422,errors.array()));
            return;
        }
        stepModel.setConfig(config.database)
        stepModel.delete({testcaseid: req.params.testcaseid,stepid: req.params.stepid},(err,data)=>{
            if(err){
                if(lib.isEmptyObject(err)){
                    res.status(400).json({error: `Test Step Details not found for ${req.params.testcaseid}`});
                }else{
                    next(lib.error(500,`internal server error ${err}`));
                }
            }else{
                res.status(200).json({success: "Test Step Details deleted succesfully"});
            }
        })
    }catch(err){
        next(lib.error(500,`internal server error ${err}`));
    }
}
exports.updateTestStep=(req,res)=>{
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            next(lib.error(422,errors.array()));
            return;
        }
        stepModel.setConfig(config.database)
        isTestStep(req.params.testcaseid, req.params.stepid).then(data =>{
            stepModel.update({testcaseid: req.params.testcaseid, stepid: req.params.stepid},{stepname: req.body.stepname,
                action: req.body.action, verification: req.body.verification, statusid: req.body.statusid
            },(err,data)=>{
                if(err){
                    if(lib.isEmptyObject(err)){
                        res.status(400).json({error:`Test Step Details not found for ${req.params.testcaseid}`});
                    }else{
                        next(lib.error(500,`internal server error ${err}`));
                    }
                }else{
                    res.status(200).json({success: "Test Step record updated succesfully", data});
                }
            })
        }).catch(error=>{
            next(lib.error(404,"No data found"));
        })
    }catch(err){
        next(lib.error(500,`internal server error ${err}`));
    }
}
exports.addTestStep=(req,res)=>{
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            next(lib.error(422,errors.array()));
            return;
        }
        stepModel.setConfig(config.database)
        stepModel.insert({stepname: req.body.stepname, action: req.body.action,
            verification: req.body.verification, testcaseid: req.params.testcaseid, statusid: req.body.statusid
        },(err,data)=>{
            if(err){
                    next(lib.error(500,`internal server error ${err}`));
            }else{
                res.status(201).json({success: "Test Step record inserted succesfully", data});
            }
        })
    }catch(err){
        next(lib.error(500,`internal server error ${err}`));
    }
}
function isTestStep(testid, stepid){
    return new Promise((resolve, reject)=>{
        stepModel.setConfig(config.database)
        stepModel.find({testcaseid: testid, stepid: stepid}, (err,data)=>{
            if(err){
                if(lib.isEmptyObject(err)){
                    reject({error:"Test step id is not found in database"})
                }else{
                    reject({error:"internal server error", err})
                }
            }else{
                if(lib.isEmptyObject(data)){
                    reject({error:"Test step id is not found in database"})
                }else{
                    resolve(data)    
                }
            }
        });
    })
}
exports.getAllSteps=(req,res)=>{
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            next(lib.error(422,errors.array()));
            return;
        }
        stepModel.setConfig(config.database)
        stepModel.find({testcaseid: req.params.testcaseid}, (err,data)=>{
            if(err){
                if(lib.isEmptyObject(err)){
                    res.status(400).json({error:"Test case id is not found in database"})
                }else{
                    res.status(500).json({error:"internal server error", err})
                }
            }else{
                if(lib.isEmptyObject(data)){
                    res.status(400).json({error:"Test case id is not found in database"})
                }else{
                    res.status(200).json(data)    
                }
            }
        })
    }catch(err){
        next(lib.error(500,`internal server error ${err}`));
    }
}