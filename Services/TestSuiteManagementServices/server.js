var express = require("express");  
var path = require("path");  
var bodyParser = require('body-parser');   
var cors = require('cors')  
var morgan = require('morgan')
var rfs = require("rotating-file-stream");
var port = process.env.PORT || '7780'  
var app = express();
var testsuite = require('./routes/testsuite')
var testsuitevalidator = require('./routes/validation/testsuite')
var caseSuite = require('./routes/suitecase')
var casevalidator = require('./routes/validation/suitecase')
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

//########### testsuite management routes ###############
app.get("/testsuite/:testsuiteid", testsuitevalidator.validate('getSuite') ,testsuite.getSuite)
app.delete("/testsuite/:testsuiteid",testsuitevalidator.validate('deleteSuite'),testsuite.deleteSuite)
app.put("/testsuite/:testsuiteid",testsuitevalidator.validate('updateSuite'),testsuite.updateSuite)
app.post("/testsuite",testsuitevalidator.validate('addSuite'),testsuite.addSuite)
app.get("/testsuite/:testsuiteid/testcases",testsuite.getTestCases)

//########### Test Case and Test Suite associative routes ######################
app.get("/testsuite/:testsuiteid/testcases/:testcaseid", casevalidator.validate('getCase'),caseSuite.getCase)
app.post("/testsuite/:testsuiteid/testcases/:testcaseid", casevalidator.validate('addCase'),caseSuite.addCase)
app.delete("/testsuite/:testsuiteid/testcases/:testcaseid", casevalidator.validate('deleteCase'),caseSuite.deleteCase)
app.put("/testsuite/:testcasesuiteid", casevalidator.validate('updateCase'),caseSuite.updateCase)

app.get("/isalive",(req,res)=>{
  res.send("ok").status(200);
})

app.listen(port,()=>{console.log(`Starting server on port ${port}`)})

module.exports = app