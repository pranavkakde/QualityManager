var express = require("express");  
var path = require("path");  
var bodyParser = require('body-parser');   
var cors = require('cors')  
var morgan = require('morgan')
var rfs = require("rotating-file-stream");
var port = process.env.PORT || '7779'  
var app = express();
var defect = require('./routes/defect')
var defectvalidator = require('./routes/validation/defect')
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

//########### Defect management routes ###############
app.get("/defect/:defectid", defectvalidator.validate('getDefect') ,defect.getDefect)
app.delete("/defect/:defectid",defectvalidator.validate('deleteDefect'),defect.deleteDefect)
app.put("/defect/:defectid",defectvalidator.validate('updateDefect'),defect.updateDefect)
app.post("/defect",defectvalidator.validate('addDefect'),defect.addDefect)
/*app.get("/users",user.getAllUsers)
app.post("/user/login", uservalidator.validate('login'),user.login)
app.post("/user/logout", uservalidator.validate('logout'),user.logout)*/

app.get("/isalive",(req,res)=>{
  res.status(200).json({"status":"ok"});
})
app.use((req, res, next)=>{  
  const error ={ error: {
   "message": "No endpoint found for this request",
    "status": 501
    }
  }  
  next(error);
})

app.use((err, req, res, next)=>{  
  res.status(err.error.status)  
  res.json({"error": err.error.message});
})
app.listen(port,()=>{console.log(`Starting server on port ${port}`)})

module.exports = app