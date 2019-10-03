var testModel = require('../Model/testcase')
var config = require('../config/config')
var lib = require('../lib/common')
var {validationResult } = require('express-validator')

exports.getTestCase= (req,res)=>{
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json({ error: errors.array() });
            return;
        }
        testModel.setConfig(config)
        isTestCase(req.params.testcaseid).then(data=>{
            res.status(200).json(data);
        }).catch(error=>{
            res.status(400).json(error);
        })
    }catch(err){
        res.status(500).json({error: "internal server error", err});
    }
}
exports.deleteTestCase=(req,res)=>{
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json({ error: errors.array() });
            return;
        }
        testModel.setConfig(config)
        testModel.delete({testcaseid: req.params.testcaseid},(err,data)=>{
            if(err){
                if(lib.isEmptyObject(err)){
                    res.status(400).json({error: `Test Case Details not found for ${req.params.testcaseid}`});
                }else{
                    res.status(500).json({error:"internal server error", err});
                }
            }else{
                res.status(200).json({message: "Test Case Details deleted succesfully", data});
            }
        })
    }catch(err){
        res.status(500).json({error: "internal server error", err});
    }
}
exports.updateTestCase=(req,res)=>{
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json({ error: errors.array() });
            return;
        }
        testModel.setConfig(config)
        isTestCase(req.params.testcaseid).then(data =>{
            testModel.update({testcaseid: req.params.testcaseid},{name: req.body.name, description: req.body.description,
                versionid: req.body.versionid, prerequisite: req.body.prerequisite, statusid: req.body.statusid,
                author: req.body.author
            },(err,data)=>{
                if(err){
                    if(lib.isEmptyObject(err)){
                        res.status(400).json({error:`Test Case Details not found for ${req.params.testcaseid}`});
                    }else{
                        res.status(500).json({error:"internal server error", err});
                    }
                }else{
                    res.status(200).json({message: "Test Case record updated succesfully", data});
                }
            })
        }).catch(error=>{
            res.status(400).json(error);
        })
    }catch(err){
        res.status(500).json({error:"internal server error", err});
    }
}
exports.addTestCase=(req,res)=>{
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json({ error: errors.array() });
            return;
        }
        testModel.setConfig(config)
        testModel.insert({name: req.body.name, description: req.body.description,
            versionid: req.body.versionid, prerequisite: req.body.prerequisite, statusid: req.body.statusid,
            author: req.body.author
        },(err,data)=>{
            if(err){
                    res.status(500).json({error:"internal server error", err});
            }else{
                res.status(201).json({message: "Test Case record inserted succesfully", data});
            }
        })
    }catch(err){
        res.status(500).json({error:"internal server error", err});
    }
}
function isTestCase(testid){
    return new Promise((resolve, reject)=>{
        testModel.setConfig(config)

        testModel.find({testcaseid: testid}, (err,data)=>{
            if(err){
                if(lib.isEmptyObject(err)){
                    reject({error:"Test case id is not found in database"})
                }else{
                    reject({error:"internal server error", err})
                }
            }else{
                if(lib.isEmptyObject(data)){
                    reject({error:"Test Case id is not found in database"})
                }else{
                    resolve(data)    
                }
            }
        });
    })
}
exports.filterReleases=(req,res)=>{
    relModel.setConfig(config)
    var sArray = req.body.releases
    /*suiteModel.aggregate(
        {
            _field: 
                [
                    {
                        _name: '_local.all'
                    }
                ],
            _filter:[       
                {
                    _field:[{_name:'testsuiteid'}],
                    _in: sArray    
                }
            ]
            }*/
        relModel.find({releaseid: sArray}
        ,function(err,data){
            if(err){
                res.status(400).json({"error": "internal server error",err})
            }else{
                res.status(200).json(data)
            }
    });
}