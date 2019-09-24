var caseModel = require('../Model/testsuitecase')
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
        isSuite(req.params.testsuiteid).then(data=>{
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
        caseModel.delete({testsuiteid: req.params.testsuiteid, testcaseid: req.params.testcaseid },(err,data)=>{
            if(err){
                if(lib.isEmptyObject(err)){
                    res.status(400).json({error: `Test Suite and associated Test case details not found for ${req.params.testsuiteid}`});
                }else{
                    res.status(500).json({error:"internal server error", err});
                }
            }else{
                res.status(200).json({message: "Test Suite and associated Test case record deleted succesfully", data});
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
        isSuite(req.params.testcasesuiteid).then(data =>{
            caseModel.update({testcasesuiteid: req.params.testcasesuiteid},{testsuiteid: req.body.testsuiteid, testcaseid: req.body.testcaseid
            },(err,data)=>{
                if(err){
                    if(lib.isEmptyObject(err)){
                        res.status(400).json({error:`Test Suite and associated test case id details not found for ${req.params.testsuiteid}`});
                    }else{
                        res.status(500).json({error:"internal server error", err});
                    }
                }else{
                    res.status(200).json({message: "TestSuite and associated test case record updated succesfully", data});
                }
            })
        }).catch(error=>{
            res.status(406).json(error);
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
        caseModel.insert({testsuiteid: req.params.testsuiteid, testcaseid: req.params.testcaseid
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
        caseModel.setConfig(config)
        caseModel.find({testsuiteid: testsuiteid, testcaseid: testcaseid}, (err,data)=>{
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
