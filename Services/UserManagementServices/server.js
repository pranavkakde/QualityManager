var express = require("express");  
var path = require("path");  
var bodyParser = require('body-parser');   
var cors = require('cors')  
var morgan = require('morgan')
var rfs = require("rotating-file-stream");
var port = process.env.PORT || '7777'  
var app = express();
var user = require('./routes/user')
var group = require('./routes/group')
var uservalidator = require('./routes/validation/user')
var uservalidator = require('./routes/validation/group')

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

//########### User management routes ###############

app.get("/user/:username", uservalidator.validate('getUser'),user.getUser)
app.delete("/user/:username",uservalidator.validate('deleteUser'),user.deleteUser)
app.put("/user/:username",uservalidator.validate('updateUser'),user.updateUser)
    
app.post("/user",uservalidator.validate('addUser'),user.addUser)
app.get("/users",user.getAllUsers)

//################## Group Management Services ################

app.get("/group/:groupname", groupvalidator.validate('getGroup'), group.getGroup)
app.delete("/group/:groupname",groupvalidator.validate('deleteGroup'),group.deleteGroup)
app.put("/group/:groupname",groupvalidator.validate('updateGroup'),group.updateGroup)
app.post("/group/:groupname",groupvalidator.validate('addGroup'),group.addGroup)

app.get("/groups", group.getAllGroups)

app.get("/isalive",(req,res)=>{
  res.send("ok").status(200);
})

app.listen(port,()=>{console.log(`Starting server on port ${port}`)})

module.exports = app