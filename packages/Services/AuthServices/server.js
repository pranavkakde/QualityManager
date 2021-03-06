require('dotenv').config()
var express = require("express");  
var path = require("path");  
var bodyParser = require('body-parser');   
var cors = require('cors')  
var morgan = require('morgan')
var rfs = require("rotating-file-stream");
var port = process.env.PORT || '8181'  
var app = express();
var authvalidator = require('./routes/validation/auth')
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./doc/doc.json');
var auth = require('./routes/auth')
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

//########### Auth management routes ###############

app.post("/auth/gettoken", authvalidator.validate('gettoken'), auth.gettoken)
app.post("/auth/validatetoken",authvalidator.validate('validatetoken'), auth.validatetoken)
//update password


app.get("/auth/isalive",(req,res)=>{
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

app.use((err, req, res, next)=>{  
  res.status(err.error.status)  
  res.json({"error": err.error.message});
})
app.listen(port,()=>{console.log(`Starting server on port ${port}`)})

module.exports = app