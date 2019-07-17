var express = require("express");  
var path = require("path");  
var bodyParser = require('body-parser');   
var cors = require('cors')  
var morgan = require('morgan')
var rfs = require("rotating-file-stream");
var port = process.env.PORT || '7777'  
//var jwt = require('jsonwebtoken')
var app = express();
var user = require('./routes/user')
var group = require('./routes/group')

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

app.route("/user/:id")
    .get(user.getUser)
    .delete(user.deleteUser)
    .put(user.updateUser)
    .post(user.addUser)

app.route("/users")
    .get(user.getAllUsers)

//################## Group Management Services ################

app.route("/group/:id")
    .get(group.getGroup)
    .delete(group.deleteGroup)
    .put(group.updateGroup)
    .post(group.addGroup)

app.route("/groups")
    .get(group.getAllGroups)

/*app.post("/gettoken",function(req,res){
  var user={
    id:'1',
    username:'admin'
  }  
  var token = jwt.sign(user,"secretkey")   
  res.json({
    token
  })
})*/

app.get("/isalive",(req,res)=>{
  res.send("ok").status(200);
})

app.listen(port,()=>{console.log(`Starting server on port ${port}`)})

module.exports = app