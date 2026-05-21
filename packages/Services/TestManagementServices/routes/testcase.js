var testModel = require('../Model/testcase')
var config = require('../config/config')
var lib = require('../lib/common')
var {validationResult } = require('express-validator')

exports.getTestCase= (req, res, next) =>{
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            next(lib.error(422,errors.array()));
            return;
        }
        testModel.setConfig(config.database)
        isTestCase(req.params.testcaseid).then(data=>{
            res.status(200).json(data);
        }).catch(error=>{
            next(lib.error(404,"No data found"));
        })
    }catch(err){
        next(lib.error(500,`internal server error ${err}`));
    }
}
function getNextVersion(currentVersion) {
    if (!currentVersion) return 'v1';
    
    // Check if it matches patterns like 'vN' or 'N'
    const vMatch = currentVersion.match(/^v(\d+)$/i);
    if (vMatch) {
        const nextNum = parseInt(vMatch[1], 10) + 1;
        return `v${nextNum}`;
    }
    
    const numMatch = currentVersion.match(/^(\d+)$/);
    if (numMatch) {
        const nextNum = parseInt(numMatch[1], 10) + 1;
        return `${nextNum}`;
    }
    
    // Fallback: append _v2 or _v[N+1]
    const appendMatch = currentVersion.match(/_v(\d+)$/i);
    if (appendMatch) {
        const nextNum = parseInt(appendMatch[1], 10) + 1;
        return currentVersion.replace(/_v\d+$/, `_v${nextNum}`);
    }
    return `${currentVersion}_v2`;
}

exports.deleteTestCase = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            next(lib.error(422, errors.array()));
            return;
        }
        testModel.setConfig(config.database);
        const testcaseid = req.params.testcaseid;
        
        // 1. Perform explicit cascading deletes
        await testModel.sequelize.query('DELETE FROM dbo.testcasesuite WHERE testcaseid = :testcaseid', {
            replacements: { testcaseid },
            type: testModel.sequelize.QueryTypes.DELETE
        });
        await testModel.sequelize.query('DELETE FROM dbo.teststeps WHERE testcaseid = :testcaseid', {
            replacements: { testcaseid },
            type: testModel.sequelize.QueryTypes.DELETE
        });
        await testModel.sequelize.query('DELETE FROM dbo.defecttestcase WHERE testcaseid = :testcaseid', {
            replacements: { testcaseid },
            type: testModel.sequelize.QueryTypes.DELETE
        });
        await testModel.sequelize.query('DELETE FROM dbo.testrun WHERE testcaseid = :testcaseid', {
            replacements: { testcaseid },
            type: testModel.sequelize.QueryTypes.DELETE
        });
        await testModel.sequelize.query('DELETE FROM dbo.testcaseversions WHERE testcaseid = :testcaseid', {
            replacements: { testcaseid },
            type: testModel.sequelize.QueryTypes.DELETE
        });
        
        // 2. Delete the test case itself
        testModel.delete({ testcaseid: testcaseid }, (err, data) => {
            if (err) {
                if (lib.isEmptyObject(err)) {
                    res.status(400).json({ error: `Test Case Details not found for ${testcaseid}` });
                } else {
                    next(lib.error(500, `internal server error ${err}`));
                }
            } else {
                res.status(200).json({ success: "Test Case Details deleted succesfully", data });
            }
        });
    } catch (err) {
        next(lib.error(500, `internal server error ${err}`));
    }
};

exports.updateTestCase = (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            next(lib.error(422, errors.array()));
            return;
        }
        testModel.setConfig(config.database);
        isTestCase(req.params.testcaseid).then(data => {
            const activeCase = Array.isArray(data) ? data[0] : data;
            const currentVersion = activeCase.versionid;
            const nextVersion = getNextVersion(currentVersion);
            
            testModel.update({ testcaseid: req.params.testcaseid }, {
                name: req.body.name,
                description: req.body.description,
                versionid: nextVersion,
                prerequisite: req.body.prerequisite,
                statusid: req.body.statusid,
                author: req.body.author,
                tag: req.body.tag
            }, (err, updateResult) => {
                if (err) {
                    if (lib.isEmptyObject(err)) {
                        res.status(400).json({ error: `Test Case Details not found for ${req.params.testcaseid}` });
                    } else {
                        next(lib.error(500, `internal server error ${err}`));
                    }
                } else {
                    // Archive the updated version in testcaseversions
                    var versionModel = require('../Model/testcaseversion');
                    versionModel.setConfig(config.database);
                    versionModel.insert({
                        testcaseid: req.params.testcaseid,
                        name: req.body.name,
                        description: req.body.description,
                        versionid: nextVersion,
                        prerequisite: req.body.prerequisite,
                        statusid: req.body.statusid,
                        author: req.body.author,
                        createdat: new Date(),
                        tag: req.body.tag
                    }, (vErr, vData) => {
                        if (vErr) {
                            console.error("Failed to archive updated test case version:", vErr);
                        }
                        res.status(200).json({ success: "Test Case record updated succesfully", data: updateResult });
                    });
                }
            });
        }).catch(error => {
            next(lib.error(404, "No data found"));
        });
    } catch (err) {
        next(lib.error(500, `internal server error ${err}`));
    }
};

exports.addTestCase = (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            next(lib.error(422, errors.array()));
            return;
        }
        testModel.setConfig(config.database);
        const initialVersion = req.body.versionid || 'v1';
        testModel.insert({
            name: req.body.name,
            description: req.body.description,
            versionid: initialVersion,
            prerequisite: req.body.prerequisite,
            statusid: req.body.statusid,
            author: req.body.author,
            tag: req.body.tag
        }, (err, data) => {
            if (err) {
                next(lib.error(500, `internal server error ${err}`));
            } else {
                // Archive initial version (v1) in testcaseversions
                var versionModel = require('../Model/testcaseversion');
                versionModel.setConfig(config.database);
                versionModel.insert({
                    testcaseid: data.testcaseid,
                    name: data.name,
                    description: data.description,
                    versionid: initialVersion,
                    prerequisite: data.prerequisite,
                    statusid: data.statusid,
                    author: data.author,
                    createdat: new Date(),
                    tag: req.body.tag
                }, (vErr, vData) => {
                    if (vErr) {
                        console.error("Failed to archive initial test case version:", vErr);
                    }
                    res.status(201).json({ success: "Test Case record inserted succesfully", data });
                });
            }
        });
    } catch (err) {
        next(lib.error(500, `internal server error ${err}`));
    }
};
function isTestCase(testid){
    return new Promise((resolve, reject)=>{
        testModel.setConfig(config.database)

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
exports.filterReleases=(req, res, next) =>{
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

exports.filterTestCases = (req, res, next) => {
    try {
        testModel.setConfig(config.database);
        var sArray = req.body.testcases;
        if (!Array.isArray(sArray) || sArray.length === 0) {
            res.status(200).json([]);
            return;
        }
        testModel.find({ testcaseid: sArray }, function(err, data){
            if (err) {
                res.status(400).json({ "error": "internal server error", err });
            } else {
                res.status(200).json(Array.isArray(data) ? data : []);
            }
        });
    } catch(err) {
        next(lib.error(500, `internal server error ${err}`));
    }
}

exports.getTestCaseVersions = (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            next(lib.error(422, errors.array()));
            return;
        }
        var versionModel = require('../Model/testcaseversion');
        versionModel.setConfig(config.database);
        
        versionModel.find({ testcaseid: req.params.testcaseid }, (err, data) => {
            if (err) {
                next(lib.error(500, `internal server error ${err}`));
            } else {
                const sorted = (Array.isArray(data) ? data : []).sort((a, b) => new Date(b.createdat) - new Date(a.createdat));
                res.status(200).json(sorted);
            }
        });
    } catch (err) {
        next(lib.error(500, `internal server error ${err}`));
    }
};