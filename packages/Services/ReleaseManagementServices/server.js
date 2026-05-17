require('dotenv').config();
require('../shared/otel');
var express = require("express");  
var path = require("path");  
var bodyParser = require('body-parser');   
var cors = require('cors')  
var morgan = require('morgan')
var rfs = require("rotating-file-stream").createStream;
var port = process.env.PORT || '7781'  
var app = express();
const sharedAuth = require('../shared/auth');
var release = require('./routes/release')
var releasevalidator = require('./routes/validation/release')
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
app.use(sharedAuth.checkAuth)

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

//########### release management routes ###############
app.get("/release/:releaseid", releasevalidator.validate('getRelease') ,release.getRelease)
app.delete("/release/:releaseid",releasevalidator.validate('deleteRelease'),release.deleteRelease)
app.put("/release/:releaseid",releasevalidator.validate('updateRelease'),release.updateRelease)
app.post("/release",releasevalidator.validate('addRelease'),release.addRelease)
app.post("/releases",releasevalidator.validate('filterReleases'),release.filterReleases)
app.post("/releases/testsuites",releasevalidator.validate('filterReleases'),caseSuite.filterReleasesTestSuites)
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
  console.error('Body:', JSON.stringify(req.body, null, 2));
  console.error('Params:', JSON.stringify(req.params, null, 2));
  console.error('Query:', JSON.stringify(req.query, null, 2));
  console.error('---');
  
  if (err.error && err.error.status) {
    // This is a custom lib.error
    console.error('Custom Error Message:', err.error.message);
    console.error('Custom Error Status:', err.error.status);
    if (err.error.innerError) console.error('Inner Error:', err.error.innerError);
    console.error('=======================================\n');
    res.status(err.error.status).json({"error": err.error.message});
  } else {
    // This is an unhandled, raw Node.js/DB crash
    console.error('RAW UNHANDLED ERROR:');
    console.error(err.stack || err);
    console.error('=======================================\n');
    res.status(500).json({"error": "Internal Server Error", "details": err.message});
  }
});
app.listen(port,()=>{console.log(`Starting server on port ${port}`)})

module.exports = app