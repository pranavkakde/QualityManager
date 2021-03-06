var defectModel = require('../Model/defect')
var config = require('../config/config')
var lib = require('../lib/common')
var {validationResult } = require('express-validator')

exports.getDefect= (req,res)=>{
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            next(lib.error(422,errors.array()));
            return;
        }
        defectModel.setConfig(config.database)
        isDefect(req.params.defectid).then(data=>{
            res.status(200).json(data);
        }).catch(error=>{
            next(lib.error(404,"No data found"));
        })
    }catch(err){
        next(lib.error(500,`internal server error ${err}`));
    }
}
exports.deleteDefect=(req,res)=>{
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            next(lib.error(422,errors.array()));
            return;
        }
        defectModel.setConfig(config.database)
        defectModel.delete({defectid: req.params.defectid},(err,data)=>{
            if(err){
                if(lib.isEmptyObject(err)){
                    next(lib.error(404,`Defect details not found for ${req.params.defectid}`));
                }else{
                    next(lib.error(500,`internal server error ${err}`));
                }
            }else{
                res.status(200).json({success: "Defect record deleted succesfully"});
            }
        })
    }catch(err){
        next(lib.error(500,`internal server error ${err}`));
    }
}
exports.updateDefect=(req,res)=>{
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            next(lib.error(422,errors.array()));
            return;
        }
        defectModel.setConfig(config.database)
        isDefect(req.params.defectid).then(data =>{
            defectModel.update({defectid: req.params.defectid},{subject: req.body.subject, description: req.body.description, 
                assignedto: req.body.assignedto, createdby: req.body.createdby, createddate: req.body.createddate, 
                defectstatusid: req.body.defectstatusid, closedby: req.body.closedby
            },(err,data)=>{
                if(err){
                    if(lib.isEmptyObject(err)){
                        next(lib.error(404,`Defect details not found for ${req.params.defectid}`));
                    }else{
                        next(lib.error(500,`internal server error ${err}`));
                    }
                }else{
                    res.status(200).json({success: "Defect record updated succesfully"});
                }
            })
        }).catch(error=>{
            next(lib.error(404,`Not found`));
        })
    }catch(err){
        next(lib.error(500,`internal server error ${err}`));
    }
}
exports.addDefect=(req,res)=>{
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            next(lib.error(422,errors.array()));
            return;
        }
        defectModel.setConfig(config.database)
        defectModel.insert({subject: req.body.subject, description: req.body.description, 
            assignedto: req.body.assignedto, createdby: req.body.createdby, createddate: req.body.createddate, 
            defectstatusid: req.body.defectstatusid, closedby: req.body.closedby
        },(err,data)=>{
            if(err){
                    next(lib.error(500,`internal server error ${err}`));
            }else{
                res.status(201).json({success: "Defect record inserted succesfully"});
            }
        })
    }catch(err){
        next(lib.error(500,`internal server error ${err}`));
    }
}
function isDefect(defectid){
    return new Promise((resolve, reject)=>{
        defectModel.setConfig(config.database)
        defectModel.find({defectid: defectid}, (err,data)=>{
            if(err){
                if(lib.isEmptyObject(err)){
                    reject({error:"defect id is not found in database"})
                }else{
                    reject({error:"internal server error", err})
                }
            }else{
                if(lib.isEmptyObject(data)){
                    reject({error:"defect id is not found in database"})
                }else{
                    resolve(data)    
                }
            }
        });
    })
}