var express = require("express");  
var path = require("path");  
var bodyParser = require('body-parser');   
var cors = require('cors')  
var morgan = require('morgan')
var rfs = require("rotating-file-stream");
var port = process.env.PORT || '7777'  
var jwt = require('jsonwebtoken')
var app = express();
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./doc/openapi.yaml');
//var auth = require('./routes/auth');
const session = require('express-session');


app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(express.static('public'));  
app.use(bodyParser.json({limit:'5mb'}));    
app.use(bodyParser.urlencoded({extended:true, limit:'5mb'}));  
app.use(cors())

 // create a rotating access log
var accessLogStream = rfs('access.log', {
    interval: '1d', // rotate daily
    path: path.join(__dirname, 'log')
})
  
// setup the logger
app.use(morgan('combined', { stream: accessLogStream }))

app.post("/gettoken",function(req,res){
  /*var user={
    id:'1',
    username:'admin'
  }*/
  
  var token = jwt.sign(user,"secretkey")   
  res.json({
    token
  })
})

app.get("/isalive",function(req,res){
  res.send("ok").status(200);
})

app.listen(port,()=>{console.log(`Starting server on port ${port}`)})