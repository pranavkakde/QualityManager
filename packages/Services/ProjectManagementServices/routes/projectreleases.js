var caseModel = require('../Model/projectreleases')
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
        caseModel.setConfig(config.database)
        isProject(req.params.releaseid, req.params.projectid).then(data=>{
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
        caseModel.setConfig(config.database)
        caseModel.delete({projectid: req.params.projectid, releaseid: req.params.releaseid },(err,data)=>{
            if(err){
                if(lib.isEmptyObject(err)){
                    res.status(400).json({error: `Project and associated Release details not found for ${req.params.releaseid}`});
                }else{
                    next(lib.error(500,`internal server error ${err}`));
                }
            }else{
                res.status(200).json({success: "Project and associated Release record deleted succesfully", data});
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
        caseModel.setConfig(config.database)
        isCase(req.params.releasesuiteid).then(data =>{
            caseModel.update({id: req.params.releasesuiteid},{projectid: req.body.projectid, releaseid: req.body.releaseid
            },(err,data)=>{
                if(err){
                    if(lib.isEmptyObject(err)){
                        res.status(400).json({error:`Project and associated Release Id details are not found for ${req.params.releaseid}`});
                    }else{
                        next(lib.error(500,`internal server error ${err}`));
                    }
                }else{
                    res.status(200).json({success: "Project and associated Release Id record updated succesfully", data});
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
        caseModel.setConfig(config.database)
        caseModel.insert({projectid: req.params.projectid, releaseid: req.params.releaseid
        },(err,data)=>{
            if(err){
                    next(lib.error(500,`internal server error ${err}`));
            }else{
                res.status(201).json({success: "Project Release record inserted succesfully", data});
            }
        })
    }catch(err){
        next(lib.error(500,`internal server error ${err}`));
    }
}
function isProject(releaseid, projectid){
    return new Promise((resolve, reject)=>{
        caseModel.setConfig(config.database)
        caseModel.find({releaseid: releaseid, projectid: projectid}, (err,data)=>{
            if(err){
                if(lib.isEmptyObject(err)){
                    reject({error:"Project Id and associated Release Id is not found in database"})
                }else{
                    reject({error:"internal server error", err})
                }
            }else{
                if(lib.isEmptyObject(data)){
                    reject({error:"Project Id and associated Release Id is not found in database"})
                }else{
                    resolve(data)    
                }
            }
        });
    })
}
async function getRels(projectid){
    return new Promise((resolve, reject)=>{
        caseModel.setConfig(config.database)
        caseModel.aggregate(
            {
                _field: 
                    [
                        {
                            _name: '_local.releaseid',
                        }
                    ],
                _filter: [      
                        {
                            _field:[{_name:'_local.projectid'}],
                            _eq: projectid
                        }
                    ]
            }
            , (err,data)=>{
            if(err){
                if(lib.isEmptyObject(err)){
                    reject({error:"Project Id and associated Release Id is not found in database"})
                }else{
                    reject({error:"internal server error", err})
                }
            }else{
                if(lib.isEmptyObject(data)){
                    reject({error:"Project Id and associated Release Id is not found in database"})
                }else{
                    resolve(data)    
                }
            }
        });
    })
}
function isCase(projectreleaseid){
    return new Promise((resolve, reject)=>{
        caseModel.setConfig(config.database)
        caseModel.find({projectreleaseid: projectreleaseid}, (err,data)=>{
            if(err){
                if(lib.isEmptyObject(err)){
                    reject({error:"Project Id and Release Id association is not found in database"})
                }else{
                    reject({error:"internal server error", err})
                }
            }else{
                if(lib.isEmptyObject(data)){
                    reject({error:"Project Id and Release Id association is not found in database"})
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
exports.getReleases = async function(req,res){
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            next(lib.error(422,errors.array()));
            return;
        }
        caseModel.setConfig(config.database)
        const data = await getRels(req.params.projectid)
        var arr = []
        if(JSON.stringify(data).indexOf("error")>0){
            res.status(400).json({"error":"Could not find Release Id for Project Id "+ req.params.projectid});
        }else{
            for (const key in data) {
                const element = data[key].releaseid;
                arr.push(element)       
            }
            const url = `${config.services.releases}releases`
            const body = {"releases": arr}
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