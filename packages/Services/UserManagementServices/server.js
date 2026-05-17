require('../shared/otel');
require('dotenv').config()
var express = require("express");  
var path = require("path");  
var bodyParser = require('body-parser');   
var cors = require('cors')  
var morgan = require('morgan')
var rfs = require("rotating-file-stream").createStream;
var port = process.env.PORT || '7777'  
var app = express();
const sharedAuth = require('../shared/auth');
var user = require('./routes/user')
var group = require('./routes/group')
var userproject = require('./routes/userproject')
var uservalidator = require('./routes/validation/user')
var groupvalidator = require('./routes/validation/group')
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./doc/doc.json');
var auth = require('./routes/auth')
const session = require('express-session')

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

//Setup app
app.use((req, res, next) => {
  console.log(`[DEBUG] Incoming Request: ${req.method} ${req.url}`);
  next();
});
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

// Global Shared Auth
// Public routes
app.post(["/login", "/user/login", "/loginUser", "/user/loginUser"], user.login)

app.use(sharedAuth.checkAuth)

//########### User project mapping routes ###############
// Supports both direct calls and Traefik stripped calls
app.get(["/projects", "/user/:userid/projects"], userproject.getUserProjects)
app.post(["/project", "/user/project"], userproject.addUserProject)
app.delete(["/:userid/project/:projectid", "/user/:userid/project/:projectid"], userproject.deleteUserProject)

//########### User management routes ###############
app.get(["/users", "/user/users"], user.getAllUsers) // Move specific list route up
app.get(["/:username", "/user/:username"], uservalidator.validate('getUser') ,user.getUser)
app.delete(["/:username", "/user/:username"],uservalidator.validate('deleteUser'),user.deleteUser)
app.put(["/:username", "/user/:username"],uservalidator.validate('updateUser'),user.updateUser)
app.post(["/", "/user"],uservalidator.validate('addUser'),user.addUser)

//################## Group Management Services ################
app.get("/group/:groupid", groupvalidator.validate('getGroup'), group.getGroup)
app.delete("/group/:groupid",groupvalidator.validate('deleteGroup'),group.deleteGroup)
app.put("/group/:groupid",groupvalidator.validate('updateGroup'),group.updateGroup)
app.post("/group",groupvalidator.validate('addGroup'),group.addGroup)
app.get("/groups", group.getAllGroups)

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

app.use((err, req, res, next) => {
  if (err.error && err.error.status) {
    res.status(err.error.status).json({"error": err.error.message});
  } else {
    res.status(500).json({"error": "Internal Server Error", "details": err.message});
  }
});

app.listen(port,()=>{console.log(`Starting server on port ${port}`)})

module.exports = app