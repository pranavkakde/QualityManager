var runModel = require('../Model/testrun')
var runCaseModel = require('../Model/testruncase')
var runStepModel = require('../Model/testrunstep')
var testModel = require('../Model/testcase')
var config = require('../config/config')
var lib = require('../lib/common')
var { validationResult } = require('express-validator')

// ==========================================
// NEW SUITE-SCOPED TEST RUN ENDPOINTS
// ==========================================

// GET /testruns/suite/:testsuiteid - Get all runs for a specific suite
exports.getSuiteRuns = async (req, res, next) => {
    try {
        const testsuiteid = req.params.testsuiteid;
        runModel.setConfig(config.database);
        
        let query = `
            SELECT tr.*, up.UserName AS creatorname, ts.name AS suitename
            FROM dbo.testrun tr
            LEFT JOIN dbo.UserProfile up ON tr.userid = up.UserId
            LEFT JOIN dbo.testsuites ts ON tr.testsuiteid = ts.testsuiteid
            WHERE tr.testsuiteid = :testsuiteid
        `;
        
        const replacements = { testsuiteid };
        
        if (req.query.status) {
            query += ` AND tr.status = :status`;
            replacements.status = req.query.status;
        }
        
        if (req.query.userid) {
            query += ` AND tr.userid = :userid`;
            replacements.userid = req.query.userid;
        }
        
        query += ` ORDER BY tr.testrunid DESC`;
        
        const runs = await runModel.sequelize.query(query, {
            replacements,
            type: runModel.sequelize.QueryTypes.SELECT
        });
        
        res.status(200).json(runs);
    } catch (err) {
        next(lib.error(500, `Internal Server Error: ${err.message}`));
    }
};

// GET /testruns/all - Get all runs globally or filtered by status, suite, etc.
exports.getGlobalRuns = async (req, res, next) => {
    try {
        runModel.setConfig(config.database);
        
        let query = `
            SELECT tr.*, up.UserName AS creatorname, ts.name AS suitename
            FROM dbo.testrun tr
            LEFT JOIN dbo.UserProfile up ON tr.userid = up.UserId
            LEFT JOIN dbo.testsuites ts ON tr.testsuiteid = ts.testsuiteid
            WHERE 1=1
        `;
        
        const replacements = {};
        
        if (req.query.testsuiteid && req.query.testsuiteid !== 'all') {
            query += ` AND tr.testsuiteid = :testsuiteid`;
            replacements.testsuiteid = req.query.testsuiteid;
        }
        
        if (req.query.status && req.query.status !== 'all') {
            query += ` AND tr.status = :status`;
            replacements.status = req.query.status;
        }
        
        if (req.query.userid && req.query.userid !== 'all') {
            query += ` AND tr.userid = :userid`;
            replacements.userid = req.query.userid;
        }
        
        query += ` ORDER BY tr.testrunid DESC`;
        
        const runs = await runModel.sequelize.query(query, {
            replacements,
            type: runModel.sequelize.QueryTypes.SELECT
        });
        
        res.status(200).json(runs);
    } catch (err) {
        next(lib.error(500, `Internal Server Error: ${err.message}`));
    }
};

// POST /testruns - Create a suite-scoped Test Run and pre-populate cases & steps
exports.createSuiteRun = async (req, res, next) => {
    try {
        const { name, testsuiteid, userid, testcaseids } = req.body;
        
        if (!name || !testsuiteid || !userid || !Array.isArray(testcaseids) || testcaseids.length === 0) {
            next(lib.error(400, "Required fields are missing: name, testsuiteid, userid, and testcaseids array."));
            return;
        }
        
        runModel.setConfig(config.database);
        
        // 1. Insert the main Test Run record
        const runInsert = await runModel.sequelize.query(`
            INSERT INTO dbo.testrun (name, runtypeid, startdate, userid, testsuiteid, status)
            OUTPUT INSERTED.testrunid
            VALUES (:name, 1, :startdate, :userid, :testsuiteid, 'New')
        `, {
            replacements: {
                name,
                startdate: new Date().toISOString(),
                userid,
                testsuiteid
            },
            type: runModel.sequelize.QueryTypes.INSERT
        });
        
        const testrunid = runInsert[0][0].testrunid;
        
        // 2. Pre-populate cases and steps for the run
        for (const testcaseid of testcaseids) {
            // A. Insert into dbo.testruncases
            await runModel.sequelize.query(`
                INSERT INTO dbo.testruncases (testrunid, testcaseid, status)
                VALUES (:testrunid, :testcaseid, 'New')
            `, {
                replacements: { testrunid, testcaseid },
                type: runModel.sequelize.QueryTypes.INSERT
            });
            
            // B. Fetch active test steps of this case
            const steps = await runModel.sequelize.query(`
                SELECT stepid FROM dbo.teststeps WHERE testcaseid = :testcaseid
            `, {
                replacements: { testcaseid },
                type: runModel.sequelize.QueryTypes.SELECT
            });
            
            // C. Insert mapping into dbo.testrunsteps
            for (const step of steps) {
                await runModel.sequelize.query(`
                    INSERT INTO dbo.testrunsteps (testrunid, testcaseid, stepid, statusid)
                    VALUES (:testrunid, :testcaseid, :stepid, 1)
                `, {
                    replacements: { testrunid, testcaseid, stepid: step.stepid },
                    type: runModel.sequelize.QueryTypes.INSERT
                });
            }
        }
        
        res.status(201).json({ success: "Test Run started successfully", testrunid });
    } catch (err) {
        next(lib.error(500, `Internal Server Error starting run: ${err.message}`));
    }
};

// GET /testruns/:testrunid/cases - Get cases and status inside a specific run
exports.getRunCases = async (req, res, next) => {
    try {
        const testrunid = req.params.testrunid;
        runModel.setConfig(config.database);
        
        const query = `
            SELECT tc.testcaseid, tc.name, tc.description, tc.versionid, tc.prerequisite, tc.author, tc.tag, trc.status 
            FROM dbo.testruncases trc
            INNER JOIN dbo.testcases tc ON trc.testcaseid = tc.testcaseid
            WHERE trc.testrunid = :testrunid
            ORDER BY tc.testcaseid ASC
        `;
        
        const cases = await runModel.sequelize.query(query, {
            replacements: { testrunid },
            type: runModel.sequelize.QueryTypes.SELECT
        });
        
        res.status(200).json(cases);
    } catch (err) {
        next(lib.error(500, `Internal Server Error fetching run cases: ${err.message}`));
    }
};

// GET /testruns/:testrunid/cases/:testcaseid/steps - Get steps execution for a case run
exports.getRunCaseSteps = async (req, res, next) => {
    try {
        const { testrunid, testcaseid } = req.params;
        runModel.setConfig(config.database);
        
        const query = `
            SELECT ts.stepid, ts.stepname, ts.action, ts.verification, trs.statusid, ss.status AS statusname
            FROM dbo.testrunsteps trs
            INNER JOIN dbo.teststeps ts ON trs.stepid = ts.stepid
            INNER JOIN dbo.stepstatus ss ON trs.statusid = ss.id
            WHERE trs.testrunid = :testrunid AND trs.testcaseid = :testcaseid
            ORDER BY ts.stepid ASC
        `;
        
        const steps = await runModel.sequelize.query(query, {
            replacements: { testrunid, testcaseid },
            type: runModel.sequelize.QueryTypes.SELECT
        });
        
        res.status(200).json(steps);
    } catch (err) {
        next(lib.error(500, `Internal Server Error fetching steps run history: ${err.message}`));
    }
};

// PUT /testruns/:testrunid/cases/:testcaseid/steps - Save step status executions and auto propagate
exports.updateRunCaseSteps = async (req, res, next) => {
    try {
        const { testrunid, testcaseid } = req.params;
        const { steps } = req.body; // Array of { stepid, statusid }
        
        if (!Array.isArray(steps)) {
            next(lib.error(400, "Required body steps array is missing."));
            return;
        }
        
        runModel.setConfig(config.database);
        
        // 1. Update each step
        for (const item of steps) {
            await runModel.sequelize.query(`
                UPDATE dbo.testrunsteps
                SET statusid = :statusid
                WHERE testrunid = :testrunid AND testcaseid = :testcaseid AND stepid = :stepid
            `, {
                replacements: {
                    statusid: item.statusid,
                    testrunid,
                    testcaseid,
                    stepid: item.stepid
                },
                type: runModel.sequelize.QueryTypes.UPDATE
            });
        }
        
        // 2. Fetch all step statuses for this case in the run to auto-calculate testcase status
        const dbSteps = await runModel.sequelize.query(`
            SELECT statusid FROM dbo.testrunsteps
            WHERE testrunid = :testrunid AND testcaseid = :testcaseid
        `, {
            replacements: { testrunid, testcaseid },
            type: runModel.sequelize.QueryTypes.SELECT
        });
        
        let computedCaseStatus = 'New';
        if (dbSteps.length > 0) {
            const ids = dbSteps.map(s => Number(s.statusid));
            if (ids.includes(3)) { // 3: Failed
                computedCaseStatus = 'Failed';
            } else if (ids.includes(4)) { // 4: Blocked
                computedCaseStatus = 'Blocked';
            } else if (ids.includes(6)) { // 6: On Hold
                computedCaseStatus = 'On Hold';
            } else if (ids.every(id => id === 2 || id === 5)) { // 2: Pass, 5: Complete
                computedCaseStatus = 'Passed';
            } else if (ids.every(id => id === 1)) { // 1: New
                computedCaseStatus = 'New';
            } else {
                computedCaseStatus = 'In Progress';
            }
        }
        
        // 3. Update the case status in dbo.testruncases
        await runModel.sequelize.query(`
            UPDATE dbo.testruncases
            SET status = :status
            WHERE testrunid = :testrunid AND testcaseid = :testcaseid
        `, {
            replacements: { status: computedCaseStatus, testrunid, testcaseid },
            type: runModel.sequelize.QueryTypes.UPDATE
        });
        
        // 4. Fetch all case statuses in the run to auto-calculate overall run status
        const dbCases = await runModel.sequelize.query(`
            SELECT status FROM dbo.testruncases
            WHERE testrunid = :testrunid
        `, {
            replacements: { testrunid },
            type: runModel.sequelize.QueryTypes.SELECT
        });
        
        let computedRunStatus = 'New';
        if (dbCases.length > 0) {
            const statuses = dbCases.map(c => c.status);
            if (statuses.every(s => s === 'New')) {
                computedRunStatus = 'New';
            } else if (statuses.every(s => s === 'Passed' || s === 'Failed' || s === 'Blocked')) {
                computedRunStatus = 'Complete';
            } else {
                computedRunStatus = 'In Progress';
            }
        }
        
        // 5. Update run overall status and dates in dbo.testrun
        let dateQuery = '';
        const replacements = { status: computedRunStatus, testrunid };
        if (computedRunStatus === 'Complete') {
            dateQuery = `, enddate = :enddate`;
            replacements.enddate = new Date().toISOString();
        }
        
        await runModel.sequelize.query(`
            UPDATE dbo.testrun
            SET status = :status ${dateQuery}
            WHERE testrunid = :testrunid
        `, {
            replacements,
            type: runModel.sequelize.QueryTypes.UPDATE
        });
        
        res.status(200).json({ 
            success: "Step execution and case run statuses updated successfully.", 
            computedCaseStatus, 
            computedRunStatus 
        });
    } catch (err) {
        next(lib.error(500, `Internal Server Error updating steps run: ${err.message}`));
    }
};

// PUT /testruns/:testrunid/cases/:testcaseid/status - Directly update case run status
exports.updateRunCaseStatusDirect = async (req, res, next) => {
    try {
        const { testrunid, testcaseid } = req.params;
        const { status } = req.body;
        
        if (!status) {
            next(lib.error(400, "Required status value is missing in body."));
            return;
        }
        
        runModel.setConfig(config.database);
        
        await runModel.sequelize.query(`
            UPDATE dbo.testruncases
            SET status = :status
            WHERE testrunid = :testrunid AND testcaseid = :testcaseid
        `, {
            replacements: { status, testrunid, testcaseid },
            type: runModel.sequelize.QueryTypes.UPDATE
        });
        
        // Recalculate overall run status
        const dbCases = await runModel.sequelize.query(`
            SELECT status FROM dbo.testruncases
            WHERE testrunid = :testrunid
        `, {
            replacements: { testrunid },
            type: runModel.sequelize.QueryTypes.SELECT
        });
        
        let computedRunStatus = 'New';
        if (dbCases.length > 0) {
            const statuses = dbCases.map(c => c.status);
            if (statuses.every(s => s === 'New')) {
                computedRunStatus = 'New';
            } else if (statuses.every(s => s === 'Passed' || s === 'Failed' || s === 'Blocked')) {
                computedRunStatus = 'Complete';
            } else {
                computedRunStatus = 'In Progress';
            }
        }
        
        let dateQuery = '';
        const replacements = { status: computedRunStatus, testrunid };
        if (computedRunStatus === 'Complete') {
            dateQuery = `, enddate = :enddate`;
            replacements.enddate = new Date().toISOString();
        }
        
        await runModel.sequelize.query(`
            UPDATE dbo.testrun
            SET status = :status ${dateQuery}
            WHERE testrunid = :testrunid
        `, {
            replacements,
            type: runModel.sequelize.QueryTypes.UPDATE
        });
        
        res.status(200).json({ success: "Case execution status updated directly", computedRunStatus });
    } catch (err) {
        next(lib.error(500, `Internal Server Error updating case execution status: ${err.message}`));
    }
};

// PUT /testruns/:testrunid - General update to a test run (e.g. name or status override)
exports.updateSuiteRunDetails = async (req, res, next) => {
    try {
        const testrunid = req.params.testrunid;
        const { name, status } = req.body;
        
        runModel.setConfig(config.database);
        
        let query = `UPDATE dbo.testrun SET testrunid = testrunid`;
        const replacements = { testrunid };
        
        if (name) {
            query += `, name = :name`;
            replacements.name = name;
        }
        if (status) {
            query += `, status = :status`;
            replacements.status = status;
            
            if (status === 'Complete') {
                query += `, enddate = :enddate`;
                replacements.enddate = new Date().toISOString();
            }
        }
        
        query += ` WHERE testrunid = :testrunid`;
        
        await runModel.sequelize.query(query, {
            replacements,
            type: runModel.sequelize.QueryTypes.UPDATE
        });
        
        res.status(200).json({ success: "Test Run updated successfully" });
    } catch (err) {
        next(lib.error(500, `Internal Server Error updating run details: ${err.message}`));
    }
};

// DELETE /testruns/:testrunid - Cascade delete run
exports.deleteSuiteRun = async (req, res, next) => {
    try {
        const testrunid = req.params.testrunid;
        runModel.setConfig(config.database);
        
        // Cascades are handled at DB level with foreign key cascades, 
        // but let's execute explicitly to ensure complete data scrubbing
        await runModel.sequelize.query('DELETE FROM dbo.testrunsteps WHERE testrunid = :testrunid', {
            replacements: { testrunid },
            type: runModel.sequelize.QueryTypes.DELETE
        });
        
        await runModel.sequelize.query('DELETE FROM dbo.testruncases WHERE testrunid = :testrunid', {
            replacements: { testrunid },
            type: runModel.sequelize.QueryTypes.DELETE
        });
        
        await runModel.sequelize.query('DELETE FROM dbo.testrun WHERE testrunid = :testrunid', {
            replacements: { testrunid },
            type: runModel.sequelize.QueryTypes.DELETE
        });
        
        res.status(200).json({ success: "Test Run deleted successfully" });
    } catch (err) {
        next(lib.error(500, `Internal Server Error deleting run: ${err.message}`));
    }
};


// ==========================================
// LEGACY BACKWARD-COMPATIBLE RUN ENDPOINTS
// ==========================================

exports.getTestRun= (req, res, next) =>{
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            next(lib.error(422,errors.array()));
            return;
        }
        runModel.setConfig(config.database)
        isTestRun(req.params.testcaseid,req.params.testrunid).then(data=>{
            res.status(200).json(data);
        }).catch(error=>{
            next(lib.error(404,"No data found"));
        })
    }catch(err){
        next(lib.error(500,`internal server error ${err}`));
    }
}
exports.deleteTestRun=(req, res, next) =>{
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            next(lib.error(422,errors.array()));
            return;
        }
        runModel.setConfig(config.database)
        runModel.delete({testcaseid: req.params.testcaseid,testrunid: req.params.testrunid},(err,data)=>{
            if(err){
                if(lib.isEmptyObject(err)){
                    res.status(400).json({error: `Test Run Details not found for ${req.params.testcaseid}`});
                }else{
                    next(lib.error(500,`internal server error ${err}`));
                }
            }else{
                res.status(200).json({success: "Test Run Details deleted succesfully"});
            }
        })
    }catch(err){
        next(lib.error(500,`internal server error ${err}`));
    }
}
exports.updateTestRun=(req, res, next) =>{
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            next(lib.error(422,errors.array()));
            return;
        }
        runModel.setConfig(config.database)
        isTestRun(req.params.testcaseid, req.params.testrunid).then(data =>{
            runModel.update({testcaseid: req.params.testcaseid, testrunid: req.params.testrunid},{name: req.body.name,
                startdate: req.body.startdate, enddate: req.body.enddate, testrunstatusid: req.body.testrunstatusid,
                userid: req.body.userid, runtypeid: req.body.runtypeid
            },(err,data)=>{
                if(err){
                    if(lib.isEmptyObject(err)){
                        res.status(400).json({error:`Test Run Details not found for ${req.params.testcaseid}`});
                    }else{
                        next(lib.error(500,`internal server error ${err}`));
                    }
                }else{
                    res.status(200).json({success: "Test Run record updated succesfully", data});
                }
            })
        }).catch(error=>{
            next(lib.error(404,"No data found"));
        })
    }catch(err){
        next(lib.error(500,`internal server error ${err}`));
    }
}
exports.addTestRun=(req, res, next) =>{
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            next(lib.error(422,errors.array()));
            return;
        }
        runModel.setConfig(config.database)
        runModel.insert({name: req.body.name,
            startdate: req.body.startdate, 
            enddate: req.body.enddate, 
            testrunstatusid: req.body.testrunstatusid,
            userid: req.body.userid, 
            runtypeid: req.body.runtypeid,
            testcaseid: req.params.testcaseid
        },(err,data)=>{
            if(err){
                    next(lib.error(500,`internal server error ${err}`));
            }else{
                res.status(201).json({success: "Test Run record inserted succesfully", data});
            }
        })
    }catch(err){
        next(lib.error(500,`internal server error ${err}`));
    }
}
function isTestRun(testid, runid){
    return new Promise((resolve, reject)=>{
        runModel.setConfig(config.database)
        runModel.find({testcaseid: testid, testrunid: runid}, (err,data)=>{
            if(err){
                if(lib.isEmptyObject(err)){
                    reject({error:"Test run id is not found in database"})
                }else{
                    reject({error:"internal server error", err})
                }
            }else{
                if(lib.isEmptyObject(data)){
                    reject({error:"Test run id is not found in database"})
                }else{
                    resolve(data)    
                }
            }
        });
    })
}
exports.getAllRuns=(req, res, next) =>{
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            next(lib.error(422,errors.array()));
            return;
        }
        runModel.setConfig(config.database)
        runModel.find({testcaseid: req.params.testcaseid}, (err,data)=>{
            if(err){
                if(lib.isEmptyObject(err)){
                    res.status(400).json({error:"Test run details are not found in database"})
                }else{
                    res.status(500).json({error:"internal server error", err})
                }
            }else{
                if(lib.isEmptyObject(data)){
                    res.status(400).json({error:"Test run details are not found in database"})
                }else{
                    res.status(200).json(data)    
                }
            }
        })
    }catch(err){
        next(lib.error(500,`internal server error ${err}`));
    }
}