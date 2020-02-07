var express = require("express");  
var path = require("path");  
var bodyParser = require('body-parser');   
var cors = require('cors')  
var morgan = require('morgan')
var rfs = require("rotating-file-stream");
var port = process.env.PORT || '7778'  
var app = express();
var client = require('./routes/client')
var clientvalidation = require('./routes/validation/client')
const expressSwagger = require('express-swagger-generator')(app);

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

let options = {
  swaggerDefinition: {
      info: {
          description: 'swagger specification for Client Management',
          title: 'Swagger',
          version: '1.0.0',
      },
      host: `localhost:${port}`,
      basePath: '/',
      produces: [
          "application/json",
          "application/xml"
      ],
      schemes: ['http', 'https'],
      securityDefinitions: {
          JWT: {
              type: 'apiKey',
              in: 'header',
              name: 'secretkey',
              description: "",
          }
      }
  },
  basedir: __dirname, //app absolute path
  files: ['./routes/*.js', './doc/api-schema.js'] //Path to the API handle folder
};
expressSwagger(options)

//########### Client management routes ###############

app.get("/client/:clientname", clientvalidation.validate('getClient'), client.getClient)    
app.delete("/client/:clientname", clientvalidation.validate('deleteClient'), client.deleteClient)
app.put("/client/:clientname", clientvalidation.validate('updateClient'), client.updateClient)
app.post("/client/",clientvalidation.validate('addClient'),client.addClient)
    //.get(client.getAllClients)
app.post("/gettoken", clientvalidation.validate('gettoken'), client.gettoken)
app.post("/validatetoken",clientvalidation.validate('validatetoken'), client.validatetoken)

app.get("/isalive",(req,res)=>{
  res.status(200);
})

app.listen(port,()=>{console.log(`Starting server on port ${port}`)})

module.exports = app






app.listen(3000);