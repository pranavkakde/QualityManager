var relModel = require('../Model/release')
var config = require('../config/config')
var lib = require('../lib/common')
var {validationResult } = require('express-validator')

exports.getRelease= (req,res)=>{
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json({ error: errors.array() });
            return;
        }
        relModel.setConfig(config.database)
        isRelease(req.params.releaseid).then(data=>{
            res.status(200).json(data);
        }).catch(error=>{
            res.status(400).json(error);
        })
    }catch(err){
        res.status(500).json({error: "internal server error", err});
    }
}
exports.deleteRelease=(req,res)=>{
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json({ error: errors.array() });
            return;
        }
        relModel.setConfig(config.database)
        relModel.delete({releaseid: req.params.releaseid},(err,data)=>{
            if(err){
                if(lib.isEmptyObject(err)){
                    res.status(400).json({error: `Release details not found for ${req.params.releaseid}`});
                }else{
                    res.status(500).json({error:"internal server error", err});
                }
            }else{
                res.status(200).json({message: "Release record deleted succesfully", data});
            }
        })
    }catch(err){
        res.status(500).json({error: "internal server error", err});
    }
}
exports.updateRelease=(req,res)=>{
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json({ error: errors.array() });
            return;
        }
        relModel.setConfig(config.database)
        isRelease(req.params.releaseid).then(data =>{
            relModel.update({releaseid: req.params.releaseid},{name: req.body.name, description: req.body.description
            },(err,data)=>{
                if(err){
                    if(lib.isEmptyObject(err)){
                        res.status(400).json({error:`Release details not found for ${req.params.releaseid}`});
                    }else{
                        res.status(500).json({error:"internal server error", err});
                    }
                }else{
                    res.status(200).json({message: "Release record updated succesfully", data});
                }
            })
        }).catch(error=>{
            res.status(400).json(error);
        })
    }catch(err){
        res.status(500).json({error:"internal server error", err});
    }
}
exports.addRelease=(req,res)=>{
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json({ error: errors.array() });
            return;
        }
        relModel.setConfig(config.database)
        relModel.insert({name: req.body.name, description: req.body.description
        },(err,data)=>{
            if(err){
                    res.status(500).json({error:"internal server error", err});
            }else{
                res.status(201).json({message: "Release record inserted succesfully", data});
            }
        })
    }catch(err){
        res.status(500).json({error:"internal server error", err});
    }
}
function isRelease(testrelid){
    return new Promise((resolve, reject)=>{
        relModel.setConfig(config.database)

        relModel.find({releaseid: testrelid}, (err,data)=>{
            if(err){
                if(lib.isEmptyObject(err)){
                    reject({error:"Release id is not found in database"})
                }else{
                    reject({error:"internal server error", err})
                }
            }else{
                if(lib.isEmptyObject(data)){
                    reject({error:"Release id is not found in database"})
                }else{
                    resolve(data)    
                }
            }
        });
    })
}
exports.filterReleases=(req,res)=>{
    relModel.setConfig(config.database)
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