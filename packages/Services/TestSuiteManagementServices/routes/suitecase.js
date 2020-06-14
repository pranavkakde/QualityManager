var caseModel = require('../Model/testsuitecase')
var config = require('../config/config')
var lib = require('../lib/common')
var {validationResult } = require('express-validator')


exports.getCase= (req,res,next)=>{
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            next(lib.error(422,errors.array()));
        }
        caseModel.setConfig(config.database)
        isSuite(req.params.testsuiteid,req.params.testcaseid).then(data=>{
            res.status(200).json(data);
        }).catch(error=>{            
            next(lib.error(404,`Test Suite and associated Test case details not found for test suite id ${req.params.testsuiteid} ${error}`))
        })
    }catch(err){        
        next(lib.error(500,`Internal Server Error ${err}`));
    }
}
exports.deleteCase=(req,res)=>{
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            next(lib.error(422,errors.array()));
            return;
        }
        caseModel.setConfig(config.database)
        caseModel.delete({testsuiteid: req.params.testsuiteid, testcaseid: req.params.testcaseid },(err,data)=>{
            if(err){
                if(lib.isEmptyObject(err)){
                    next(lib.error(404,`Test Suite and associated Test case details not found for ${req.params.testsuiteid}`))
                }else{
                    next(lib.error(500,`Internal Server Error ${err}`));
                }
            }else{
                res.status(204).json({success:`Test Suite and associated Test case record deleted succesfully`});
            }
        })
    }catch(err){
        next(lib.error(500,`Internal Server Error ${err}`));
    }
}
exports.updateCase=(req,res)=>{
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            next(lib.error(422,errors.array()));
            return;
        }
        console.log(req.params.testcasesuiteid)
        caseModel.setConfig(config.database)
        isCase(req.params.testcasesuiteid).then(data =>{
            caseModel.update({id: req.params.testcasesuiteid},{testsuiteid: req.body.testsuiteid, testcaseid: req.body.testcaseid
            },(err,data)=>{
                if(err){
                    if(lib.isEmptyObject(err)){
                        next(lib.error(404,`Test Suite and associated Test case details not found for Test Suite Id ${req.params.testsuiteid}`))
                    }else{
                        next(lib.error(500,`Internal Server Error ${err}`));
                    }
                }else{
                    res.status(200).json({success:`TestSuite and associated test case record updated succesfully. ${data}`});
                }
            })
        }).catch(error=>{
            next(lib.error(404,`Associated Test case details not found for Test Case Id ${req.params.testcasesuiteid}`))
        })
    }catch(err){
        next(lib.error(500,`Internal Server Error ${err}`));
    }
}
exports.addCase=(req,res)=>{
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            next(lib.error(422,errors.array()));
            return;
        }
        caseModel.setConfig(config.database)
        caseModel.insert({testsuiteid: req.params.testsuiteid, testcaseid: req.params.testcaseid
        },(err,data)=>{
            if(err){
                    next(lib.error(500,`Internal Server Error ${err}`));
            }else{
                res.status(201).json({success: `TestSuite record inserted succesfully ${data}`});
            }
        })
    }catch(err){
        next(lib.error(500,`Internal Server Error ${err}`));
    }
}
function isSuite(testsuiteid,testcaseid){
    return new Promise((resolve, reject)=>{
        caseModel.setConfig(config.database)
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
function isCase(testcasesuiteid){
    return new Promise((resolve, reject)=>{
        caseModel.setConfig(config.database)
        caseModel.find({testcasesuiteid: testcasesuiteid}, (err,data)=>{
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
