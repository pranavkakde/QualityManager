var caseModel = require('../Model/releasesuite')
var config = require('../config/config')
var lib = require('../lib/common')
var {validationResult } = require('express-validator')
var request = require('superagent')

exports.getCase= (req,res)=>{
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            next(lib.error(422,errors.array()));
            return;
        }
        caseModel.setConfig(config)
        isRel(req.params.releaseid, req.params.testsuiteid).then(data=>{
            res.status(200).json(data);
        }).catch(error=>{
            next(lib.error(404,"No data found"));
        })
    }catch(err){
        next(lib.error(500,`internal server error ${err}`));
    }
}
exports.deleteCase=(req,res)=>{
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            next(lib.error(422,errors.array()));
            return;
        }
        caseModel.setConfig(config)
        caseModel.delete({testsuiteid: req.params.testsuiteid, releaseid: req.params.releaseid },(err,data)=>{
            if(err){
                if(lib.isEmptyObject(err)){
                    res.status(400).json({error: `Release and associated Test Suite details not found for ${req.params.releaseid}`});
                }else{
                    next(lib.error(500,`internal server error ${err}`));
                }
            }else{
                res.status(200).json({success: "Release and associated Test Suite record deleted succesfully", data});
            }
        })
    }catch(err){
        next(lib.error(500,`internal server error ${err}`));
    }
}
exports.updateCase=(req,res)=>{
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            next(lib.error(422,errors.array()));
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
                        next(lib.error(500,`internal server error ${err}`));
                    }
                }else{
                    res.status(200).json({success: "Release and associated Test Suite record updated succesfully", data});
                }
            })
        }).catch(error=>{
            next(lib.error(404,"No data found"));
        })
    }catch(err){
        next(lib.error(500,`internal server error ${err}`));
    }
}
exports.addCase=(req,res)=>{
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            next(lib.error(422,errors.array()));
            return;
        }
        caseModel.setConfig(config)
        caseModel.insert({testsuiteid: req.params.testsuiteid, releaseid: req.params.releaseid
        },(err,data)=>{
            if(err){
                    next(lib.error(500,`internal server error ${err}`));
            }else{
                res.status(201).json({success: "Release and Test Suite record inserted succesfully", data});
            }
        })
    }catch(err){
        next(lib.error(500,`internal server error ${err}`));
    }
}
function isRel(releaseid, testsuiteid){
    return new Promise((resolve, reject)=>{
        caseModel.setConfig(config)
        //rewrite this to get release id and test suite id by calling GET Test suite by id service. 
        caseModel.find({releaseid: releaseid, testsuiteid: testsuiteid}, (err,data)=>{
            if(err){
                if(lib.isEmptyObject(err)){
                    reject({error:"Release Id and associated Test Suite is not found in database"})
                }else{
                    reject({error:"internal server error", err})
                }
            }else{
                if(lib.isEmptyObject(data)){
                    reject({error:"Release Id and associated Test Suite is not found in database"})
                }else{
                    resolve(data)    
                }
            }
        });
    })
}
async function getTestSuites(releaseid){
    return new Promise((resolve, reject)=>{
        caseModel.setConfig(config)
        caseModel.aggregate(
            {
                _field: 
                    [
                        {
                            _name: '_local.testsuiteid',
                        }
                    ],
                _filter: [      
                        {
                            _field:[{_name:'_local.releaseid'}],
                            _eq: releaseid
                        }
                    ]
            }
            , (err,data)=>{
            if(err){
                if(lib.isEmptyObject(err)){
                    reject({error:"Release Id and associated Test Suite is not found in database"})
                }else{
                    reject({error:"internal server error", err})
                }
            }else{
                if(lib.isEmptyObject(data)){
                    reject({error:"Release Id and associated Test Suite is not found in database"})
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
exports.getTestCases=(req,res)=>{
    res.status(200).json({"message":"This service is still in progress. This will be completed once CRUD on Test Case Service is complete."})
}
exports.getTestSuites = async function(req,res,next){
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            next(lib.error(422,errors.array()));
            return;
        }
        caseModel.setConfig(config)
        const data = await getTestSuites(req.params.releaseid)
        var arr = []
        if(JSON.stringify(data).indexOf("error")>0){
            next(lib.error(404,`Could not find Test Suites for Release Id ${req.params.releaseid}`));
        }else{
            for (const key in data) {
                const element = data[key].testsuiteid;
                arr.push(element)       
            }
            const url = `${config.services.testsuite}testsuites`
            const body = {"testsuites": arr}
            const resp = await request
                .post(url)
                .send(body)
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json');
            res.status(200).json(resp.body);
        }
    }catch(err){
        next(lib.error(500,`internal server error ${err}`));
    }
}
exports.getDefects=(req,res)=>{
    res.status(200).json({"message":"This service is still in progress. This will be completed once CRUD on Test Case Service is complete."})
}
exports.filterReleasesTestSuites=(req,res, next)=>{
    try{
        /*const errors = validationResult(req);
        if (!errors.isEmpty()) {
            next(lib.error(422,errors.array()));
            return;
        }*/
        caseModel.setConfig(config.database);        
            caseModel.join(
                {
                    _join: [{
                        _localkey: 'testsuiteid',
                        _foreignkey: 'testsuiteid',
                        _foreignTable: 'dbo.[testsuites]',
                        _type: 'inner',
                        _name: '$join1'
                    }],
                    _field: 
                        [
                            {
                                _name: '_local.releaseid'                                
                            },
                            {
                                _name: '_foreign.all',
                                _join: '$join1'
                            }
                        ],
                    _filter: [      
                            {
                                _field:[{_name:'_local.releaseid'}],
                                _in: [req.body.releaseids]
                            }
                        ]
                }
                , (err,data)=>{
                    if(err){
                        if(lib.isEmptyObject(err)){
                            next(lib.error(404,"Release Id and associated Test Suite is not found in database"));
                        }else{
                            next(lib.error(500,`internal server error${err}`));
                        }
                    }else{
                        if(lib.isEmptyObject(data)){
                            next(lib.error(500,"Release Id and associated Test Suite is not found in database"));
                        }else{
                            res.status(200).json(data);  
                        }
                    }
            });     
    }catch(err){
        next(lib.error(500,`internal server error ${err}`));
    }
}