var defectModel = require('../Model/defect')
var config = require('../config/config')
var lib = require('../lib/common')
var bcrypt = require('bcrypt')
var {validationResult } = require('express-validator')

exports.getDefect= (req,res)=>{
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json({ error: errors.array() });
            return;
        }
        defectModel.setConfig(config)
        isDefect(req.params.defectid).then(data=>{
            res.status(200).json(data);
        }).catch(error=>{
            res.status(400).json(error);
        })
    }catch(err){
        res.status(500).json({error: "internal server error", err});
    }
}
exports.deleteDefect=(req,res)=>{
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json({ error: errors.array() });
            return;
        }
        defectModel.setConfig(config)
        defectModel.delete({defectid: req.params.defectid},(err,data)=>{
            if(err){
                if(lib.isEmptyObject(err)){
                    res.status(400).json({error: `defectid details not found for ${req.params.defectid}`});
                }else{
                    res.status(500).json({error:"internal server error", err});
                }
            }else{
                res.status(200).json({message: "Defect record deleted succesfully"});
            }
        })
    }catch(err){
        res.status(500).json({error: "internal server error", err});
    }
}
exports.updateDefect=(req,res)=>{
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json({ error: errors.array() });
            return;
        }
        defectModel.setConfig(config)
        isDefect(req.params.defectid).then(data =>{
            defectModel.update({defectid: req.params.defectid},{subject: req.body.subject, description: req.body.description, 
                assignedto: req.body.assignedto, createdby: req.body.createdby, createddate: req.body.createddate, 
                defectstatusid: req.body.defectstatusid, closedby: req.body.closedby
            },(err,data)=>{
                if(err){
                    if(lib.isEmptyObject(err)){
                        res.status(400).json({error:`Defect details not found for ${req.params.defectid}`});
                    }else{
                        res.status(500).json({error:"internal server error", err});
                    }
                }else{
                    res.status(200).json({message: "Defect record updated succesfully"});
                }
            })
        }).catch(error=>{
            res.status(406).json(error);
        })
    }catch(err){
        res.status(500).json({error:"internal server error", err});
    }
}
exports.addDefect=(req,res)=>{
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json({ error: errors.array() });
            return;
        }
        defectModel.setConfig(config)
        defectModel.insert({subject: req.body.subject, description: req.body.description, 
            assignedto: req.body.assignedto, createdby: req.body.createdby, createddate: req.body.createddate, 
            defectstatusid: req.body.defectstatusid, closedby: req.body.closedby
        },(err,data)=>{
            if(err){
                    res.status(500).json({error:"internal server error", err});
            }else{
                res.status(201).json({message: "Defect record inserted succesfully"});
            }
        })
    }catch(err){
        res.status(500).json({error:"internal server error", err});
    }
}
function isDefect(defectid){
    return new Promise((resolve, reject)=>{
        defectModel.setConfig(config)
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