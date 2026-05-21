require('../shared/otel');
var express = require("express");  
var path = require("path");  
var bodyParser = require('body-parser');   
var cors = require('cors')  
var morgan = require('morgan')
var rfs = require("rotating-file-stream").createStream;
var port = process.env.PORT || '7784'  
var app = express();
var testcase = require('./routes/testcase')
var testvalidator = require('./routes/validation/testcase')
var teststep = require('./routes/steps')
var stepvalidator = require('./routes/validation/steps')
var testrun = require('./routes/testrun')
var runvalidator = require('./routes/validation/testrun')
var caseSuite = require('./routes/releasesuite')
var casevalidator = require('./routes/validation/releasesuite')
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./doc/openapi.json');
const sharedAuth = require('../shared/auth');
const session = require('express-session')

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

//Setup app
app.use(express.static('public'));  
app.use(bodyParser.json({limit:'5mb'}));    
app.use(bodyParser.urlencoded({extended:true, limit:'5mb'}));  
app.use(bodyParser.text());                                    
app.use(bodyParser.json({ type: 'application/json'}));
app.use(cors())

// create a rotating access log
var accessLogStream = rfs('access.log', {
    interval: '1d', // rotate daily
    path: path.join(__dirname, 'log')
})
  
// setup the logger
app.use(morgan('combined', { stream: accessLogStream }))

// Apply shared JWT authentication middleware
app.use(sharedAuth.checkAuth)

//########### Test management routes ###############
app.get("/:testcaseid", testvalidator.validate('getTestCase') ,testcase.getTestCase)
app.delete("/:testcaseid",testvalidator.validate('deleteTestCase'),testcase.deleteTestCase)
app.put("/:testcaseid",testvalidator.validate('updateTestCase'),testcase.updateTestCase)
app.post("/",testvalidator.validate('addTestCase'),testcase.addTestCase)
app.post("/filter", testvalidator.validate('filterTestCases'), testcase.filterTestCases)
app.get("/:testcaseid/versions", testvalidator.validate('getTestCase'), testcase.getTestCaseVersions)

//########### Test Steps routes ######################
app.get("/testcasesteps/:testcaseid/steps/:stepid", stepvalidator.validate('getTestStep') ,teststep.getTestStep)
app.delete("/testcasesteps/:testcaseid/steps/:stepid",stepvalidator.validate('deleteTestStep'),teststep.deleteTestStep)
app.put("/testcasesteps/:testcaseid/steps/:stepid",stepvalidator.validate('updateTestStep'),teststep.updateTestStep)
app.post("/testcasesteps/:testcaseid/steps",stepvalidator.validate('addTestStep'),teststep.addTestStep)
app.get("/testcasesteps/:testcaseid/steps",stepvalidator.validate('getAllSteps'),teststep.getAllSteps)
//########### Test Run routes ######################
app.get("/testcaseruns/:testcaseid/testruns/:testrunid", runvalidator.validate('getTestRun') ,testrun.getTestRun)
app.delete("/testcaseruns/:testcaseid/testruns/:testrunid",runvalidator.validate('deleteTestRun'),testrun.deleteTestRun)
app.put("/testcaseruns/:testcaseid/testruns/:testrunid",runvalidator.validate('updateTestRun'),testrun.updateTestRun)
app.post("/testcaseruns/:testcaseid/testruns",runvalidator.validate('addTestRun'),testrun.addTestRun)
app.get("/testcaseruns/:testcaseid/testruns",runvalidator.validate('getAllRuns'),testrun.getAllRuns)

// New Suite-scoped Test Runs Routes
app.get("/testruns/suite/:testsuiteid", testrun.getSuiteRuns)
app.get("/testruns/all", testrun.getGlobalRuns)
app.post("/testruns", testrun.createSuiteRun)
app.get("/testruns/:testrunid/cases", testrun.getRunCases)
app.get("/testruns/:testrunid/cases/:testcaseid/steps", testrun.getRunCaseSteps)
app.put("/testruns/:testrunid/cases/:testcaseid/steps", testrun.updateRunCaseSteps)
app.put("/testruns/:testrunid/cases/:testcaseid/status", testrun.updateRunCaseStatusDirect)
app.put("/testruns/:testrunid", testrun.updateSuiteRunDetails)
app.delete("/testruns/:testrunid", testrun.deleteSuiteRun)

//########### Release and Test Suite associative routes ######################
app.get("/release/:releaseid/testsuite/:testsuiteid", casevalidator.validate('getCase'),caseSuite.getCase)
app.post("/release/:releaseid/testsuite/:testsuiteid", casevalidator.validate('addCase'),caseSuite.addCase)
app.delete("/release/:releaseid/testsuite/:testsuiteid", casevalidator.validate('deleteCase'),caseSuite.deleteCase)
app.put("/releasesuite/:releasesuiteid", casevalidator.validate('updateCase'),caseSuite.updateCase)
app.get("/release/:releaseid/testsuites",caseSuite.getTestSuites)
app.get("/release/:releaseid/testcases",caseSuite.getTestCases)
app.get("/release/:releaseid/defects",caseSuite.getDefects)

app.get("/isalive",(req,res)=>{
  res.send("ok").status(200);
})

app.use((req, res, next)=>{  
  const error ={ error: {
   "message": "No endpoint found for this request",
    "status": 501
    }
  }  
  next(error);
})

app.use((err, req, res, next) => {
  // Enhanced Telemetry / Logging
  console.error('\n================ ERROR ================');
  console.error('Time:', new Date().toISOString());
  console.error('Path:', req.method, req.originalUrl);
  
  if (err.error && err.error.status) {
    res.status(err.error.status).json({"error": err.error.message});
  } else {
    res.status(500).json({"error": "Internal Server Error", "details": err.message});
  }
});

app.listen(port,()=>{console.log(`Starting server on port ${port}`)})

module.exports = app