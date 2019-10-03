var express = require("express");  
var path = require("path");  
var bodyParser = require('body-parser');   
var cors = require('cors')  
var morgan = require('morgan')
var rfs = require("rotating-file-stream");
var port = process.env.PORT || '7784'  
var app = express();
var testcase = require('./routes/testcase')
var testvalidator = require('./routes/validation/testcase')
var caseSuite = require('./routes/releasesuite')
var casevalidator = require('./routes/validation/releasesuite')
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./doc/openapi.json');
//var auth = require('./routes/auth')
const session = require('express-session')

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

//Setup app
app.use(express.static('public'));  
app.use(bodyParser.json({limit:'5mb'}));    
app.use(bodyParser.urlencoded({extended:true, limit:'5mb'}));  
app.use(bodyParser.text());                                    
app.use(bodyParser.json({ type: 'application/json'}));
app.use(cors())

//create a session
/*app.use(session({
  secret: 'new session',
  resave: true,
  saveUninitialized: false,
  cookie: { maxAge: 60000 }}
));*/

// create a rotating access log
var accessLogStream = rfs('access.log', {
    interval: '1d', // rotate daily
    path: path.join(__dirname, 'log')
})
  
// setup the logger
app.use(morgan('combined', { stream: accessLogStream }))
/*app.use(auth.checkLogin)
app.use(auth.checkRequiredRole)*/

//########### Test management routes ###############
app.get("/testcase/:testcaseid", testvalidator.validate('getTestCase') ,testcase.getTestCase)
app.delete("/testcase/:testcaseid",testvalidator.validate('deleteTestCase'),testcase.deleteTestCase)
app.put("/testcase/:testcaseid",testvalidator.validate('updateTestCase'),testcase.updateTestCase)
app.post("/testcase",testvalidator.validate('addTestCase'),testcase.addTestCase)
//app.post("/releases",testvalidator.validate('filterReleases'),release.filterReleases)
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

app.listen(port,()=>{console.log(`Starting server on port ${port}`)})

module.exports = app