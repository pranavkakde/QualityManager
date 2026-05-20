var defectModel = require('../Model/defect')
var defectStatusModel = require('../Model/defectstatus')
var defectTestCaseModel = require('../Model/defecttestcase')
var config = require('../config/config')
var lib = require('../lib/common')
var {validationResult } = require('express-validator')

exports.getDefect= (req, res, next) =>{
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
exports.deleteDefect=(req, res, next) =>{
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
function saveMappings(databaseConfig, defectid, testcases) {
    return new Promise((resolve, reject) => {
        if (!Array.isArray(testcases) || testcases.length === 0) {
            return resolve();
        }
        defectTestCaseModel.setConfig(databaseConfig);
        let promises = testcases.map(tc => {
            return new Promise((res, rej) => {
                defectTestCaseModel.insert({
                    defectid: defectid,
                    testsuiteid: tc.testsuiteid,
                    testcaseid: tc.testcaseid
                }, (err, data) => {
                    if (err) {
                        console.error('Error inserting mapping:', err);
                        rej(err);
                    } else {
                        res(data);
                    }
                });
            });
        });
        Promise.all(promises).then(resolve).catch(reject);
    });
}

function updateMappings(databaseConfig, defectid, testcases) {
    return new Promise((resolve, reject) => {
        defectTestCaseModel.setConfig(databaseConfig);
        defectTestCaseModel.delete({ defectid: defectid }, (err, result) => {
            if (err) {
                console.error('Error deleting existing mappings:', err);
                return reject(err);
            }
            saveMappings(databaseConfig, defectid, testcases).then(resolve).catch(reject);
        });
    });
}

exports.getDefectTestCases = (req, res, next) => {
    try {
        defectTestCaseModel.setConfig(config.database);
        defectTestCaseModel.find({ defectid: Number(req.params.defectid) }, (err, data) => {
            if (err) {
                if (lib.isEmptyObject(err)) {
                    res.status(200).json([]);
                } else {
                    next(lib.error(500, `internal server error ${err}`));
                }
            } else {
                res.status(200).json(Array.isArray(data) ? data : []);
            }
        });
    } catch (err) {
        next(lib.error(500, `internal server error ${err}`));
    }
};

exports.getAllDefectTestCases = (req, res, next) => {
    try {
        defectTestCaseModel.setConfig(config.database);
        defectTestCaseModel.find({}, (err, data) => {
            if (err) {
                if (lib.isEmptyObject(err)) {
                    res.status(200).json([]);
                } else {
                    next(lib.error(500, `internal server error ${err}`));
                }
            } else {
                res.status(200).json(Array.isArray(data) ? data : []);
            }
        });
    } catch (err) {
        next(lib.error(500, `internal server error ${err}`));
    }
};


exports.updateDefect=(req, res, next) =>{
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
                defectstatusid: req.body.defectstatusid, closedby: req.body.closedby, releaseid: req.body.releaseid
            },(err,data)=>{
                if(err){
                    if(lib.isEmptyObject(err)){
                        next(lib.error(404,`Defect details not found for ${req.params.defectid}`));
                    }else{
                        next(lib.error(500,`internal server error ${err}`));
                    }
                }else{
                    updateMappings(config.database, req.params.defectid, req.body.testcases || [])
                        .then(() => {
                            res.status(200).json({success: "Defect record updated succesfully"});
                        })
                        .catch(updateErr => {
                            next(lib.error(500, `internal server error updating mappings ${updateErr}`));
                        });
                }
            })
        }).catch(error=>{
            next(lib.error(404,`Not found`));
        })
    }catch(err){
        next(lib.error(500,`internal server error ${err}`));
    }
}

exports.addDefect=(req, res, next) =>{
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            next(lib.error(422,errors.array()));
            return;
        }
        defectModel.setConfig(config.database)
        defectModel.insert({subject: req.body.subject, description: req.body.description, 
            assignedto: req.body.assignedto, createdby: req.body.createdby, createddate: req.body.createddate, 
            defectstatusid: req.body.defectstatusid, closedby: req.body.closedby, releaseid: req.body.releaseid
        },(err,data)=>{
            if(err){
                next(lib.error(500,`internal server error ${err}`));
            }else{
                const newDefectId = data.defectid || data.id;
                saveMappings(config.database, newDefectId, req.body.testcases || [])
                    .then(() => {
                        res.status(201).json({success: "Defect record inserted succesfully", data});
                    })
                    .catch(saveErr => {
                        next(lib.error(500, `internal server error saving mappings ${saveErr}`));
                    });
            }
        })
    }catch(err){
        next(lib.error(500,`internal server error ${err}`));
    }
}
exports.getDefects = (req, res, next) => {
    try {
        defectModel.setConfig(config.database);
        const filter = {};
        if (req.query.releaseid) {
            filter.releaseid = Number(req.query.releaseid);
        }
        defectModel.find(filter, (err, data) => {
            if (err) {
                if (lib.isEmptyObject(err)) {
                    res.status(200).json([]);
                } else {
                    next(lib.error(500, `internal server error ${err}`));
                }
            } else {
                res.status(200).json(Array.isArray(data) ? data : []);
            }
        });
    } catch (err) {
        next(lib.error(500, `internal server error ${err}`));
    }
}
exports.getStatuses = (req, res, next) => {
    try {
        defectStatusModel.setConfig(config.database);
        defectStatusModel.find({}, (err, data) => {
            if (err) {
                if (lib.isEmptyObject(err)) {
                    res.status(200).json([]);
                } else {
                    next(lib.error(500, `internal server error ${err}`));
                }
            } else {
                res.status(200).json(Array.isArray(data) ? data : []);
            }
        });
    } catch (err) {
        next(lib.error(500, `internal server error ${err}`));
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