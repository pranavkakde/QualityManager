var runModel = require('../Model/testrun')
var config = require('../config/config')
var lib = require('../lib/common')
var {validationResult } = require('express-validator')

exports.getTestRun= (req,res)=>{
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            next(lib.error(422,errors.array()));
            return;
        }
        runModel.setConfig(config.database)
        isTestRun(req.params.testcaseid,req.params.testrunid).then(data=>{
            res.status(200).json(data);
        }).catch(error=>{
            next(lib.error(404,"No data found"));
        })
    }catch(err){
        next(lib.error(500,`internal server error ${err}`));
    }
}
exports.deleteTestRun=(req,res)=>{
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            next(lib.error(422,errors.array()));
            return;
        }
        runModel.setConfig(config.database)
        runModel.delete({testcaseid: req.params.testcaseid,testrunid: req.params.testrunid},(err,data)=>{
            if(err){
                if(lib.isEmptyObject(err)){
                    res.status(400).json({error: `Test Run Details not found for ${req.params.testcaseid}`});
                }else{
                    next(lib.error(500,`internal server error ${err}`));
                }
            }else{
                res.status(200).json({success: "Test Run Details deleted succesfully"});
            }
        })
    }catch(err){
        next(lib.error(500,`internal server error ${err}`));
    }
}
exports.updateTestRun=(req,res)=>{
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            next(lib.error(422,errors.array()));
            return;
        }
        runModel.setConfig(config.database)
        isTestRun(req.params.testcaseid, req.params.testrunid).then(data =>{
            runModel.update({testcaseid: req.params.testcaseid, testrunid: req.params.testrunid},{name: req.body.name,
                startdate: req.body.startdate, enddate: req.body.enddate, testrunstatusid: req.body.testrunstatusid,
                userid: req.body.userid, runtypeid: req.body.runtypeid
            },(err,data)=>{
                if(err){
                    if(lib.isEmptyObject(err)){
                        res.status(400).json({error:`Test Run Details not found for ${req.params.testcaseid}`});
                    }else{
                        next(lib.error(500,`internal server error ${err}`));
                    }
                }else{
                    res.status(200).json({success: "Test Run record updated succesfully", data});
                }
            })
        }).catch(error=>{
            next(lib.error(404,"No data found"));
        })
    }catch(err){
        next(lib.error(500,`internal server error ${err}`));
    }
}
exports.addTestRun=(req,res)=>{
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            next(lib.error(422,errors.array()));
            return;
        }
        runModel.setConfig(config.database)
        runModel.insert({name: req.body.name,
            startdate: req.body.startdate, 
            enddate: req.body.enddate, 
            testrunstatusid: req.body.testrunstatusid,
            userid: req.body.userid, 
            runtypeid: req.body.runtypeid,
            testcaseid: req.params.testcaseid
        },(err,data)=>{
            if(err){
                    next(lib.error(500,`internal server error ${err}`));
            }else{
                res.status(201).json({success: "Test Run record inserted succesfully", data});
            }
        })
    }catch(err){
        next(lib.error(500,`internal server error ${err}`));
    }
}
function isTestRun(testid, runid){
    return new Promise((resolve, reject)=>{
        runModel.setConfig(config.database)
        runModel.find({testcaseid: testid, testrunid: runid}, (err,data)=>{
            if(err){
                if(lib.isEmptyObject(err)){
                    reject({error:"Test run id is not found in database"})
                }else{
                    reject({error:"internal server error", err})
                }
            }else{
                if(lib.isEmptyObject(data)){
                    reject({error:"Test run id is not found in database"})
                }else{
                    resolve(data)    
                }
            }
        });
    })
}
exports.getAllRuns=(req,res)=>{
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            next(lib.error(422,errors.array()));
            return;
        }
        runModel.setConfig(config.database)
        runModel.find({testcaseid: req.params.testcaseid}, (err,data)=>{
            if(err){
                if(lib.isEmptyObject(err)){
                    res.status(400).json({error:"Test run details are not found in database"})
                }else{
                    res.status(500).json({error:"internal server error", err})
                }
            }else{
                if(lib.isEmptyObject(data)){
                    res.status(400).json({error:"Test run details are not found in database"})
                }else{
                    res.status(200).json(data)    
                }
            }
        })
    }catch(err){
        next(lib.error(500,`internal server error ${err}`));
    }
}