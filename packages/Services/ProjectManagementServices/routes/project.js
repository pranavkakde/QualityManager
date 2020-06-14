var projectModel = require('../Model/project')
var config = require('../config/config')
var lib = require('../lib/common')
var {validationResult } = require('express-validator')

exports.getProject= (req,res)=>{
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            next(lib.error(422,errors.array()));
            return;
        }
        projectModel.setConfig(config.database)
        isProject(req.params.projectid).then(data=>{
            res.status(200).json(data);
        }).catch(error=>{
            next(lib.error(404,"No data found"));
        })
    }catch(err){
        next(lib.error(500,`internal server error ${err}`));
    }
}
exports.deleteProject=(req,res)=>{
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            next(lib.error(422,errors.array()));
            return;
        }
        projectModel.setConfig(config.database)
        projectModel.delete({projectid: req.params.projectid},(err,data)=>{
            if(err){
                if(lib.isEmptyObject(err)){
                    res.status(400).json({error: `Project details not found for ${req.params.projectid}`});
                }else{
                    next(lib.error(500,`internal server error ${err}`));
                }
            }else{
                res.status(200).json({success: "Project record deleted succesfully", data});
            }
        })
    }catch(err){
        next(lib.error(500,`internal server error ${err}`));
    }
}
exports.updateProject=(req,res)=>{
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            next(lib.error(422,errors.array()));
            return;
        }
        projectModel.setConfig(config.database)
        isProject(req.params.projectid).then(data =>{
            projectModel.update({projectid: req.params.projectid},{name: req.body.name, description: req.body.description
            },(err,data)=>{
                if(err){
                    if(lib.isEmptyObject(err)){
                        res.status(400).json({error:`Project details not found for ${req.params.projectid}`});
                    }else{
                        next(lib.error(500,`internal server error ${err}`));
                    }
                }else{
                    res.status(200).json({success: "Project record updated succesfully", data});
                }
            })
        }).catch(error=>{
            next(lib.error(404,"No data found"));
        })
    }catch(err){
        next(lib.error(500,`internal server error ${err}`));
    }
}
exports.addProject=(req,res)=>{
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            next(lib.error(422,errors.array()));
            return;
        }
        projectModel.setConfig(config.database)
        projectModel.insert({name: req.body.name, description: req.body.description
        },(err,data)=>{
            if(err){
                    next(lib.error(500,`internal server error ${err}`));
            }else{
                res.status(201).json({success: "Project record inserted succesfully", data});
            }
        })
    }catch(err){
        next(lib.error(500,`internal server error ${err}`));
    }
}
function isProject(pid){
    return new Promise((resolve, reject)=>{
        projectModel.setConfig(config.database)

        projectModel.find({projectid: pid}, (err,data)=>{
            if(err){
                if(lib.isEmptyObject(err)){
                    reject({error:"Project id is not found in database"})
                }else{
                    reject({error:"internal server error", err})
                }
            }else{
                if(lib.isEmptyObject(data)){
                    reject({error:"Project id is not found in database"})
                }else{
                    resolve(data)    
                }
            }
        });
    })
}
