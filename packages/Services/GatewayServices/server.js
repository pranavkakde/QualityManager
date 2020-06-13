require('dotenv').config();
var express = require("express");  
var path = require("path");  
var bodyParser = require('body-parser');
const cors = require('cors')  
var app = express();  
var port = process.env.PORT || '10104'  
var serviceModel = require('./Model/Service')
var morgan = require('morgan')
var rfs = require("rotating-file-stream");
var http = require('http').Server(app);
var io = require('socket.io')(http);

var servicemgmt = require('./router/servicemgmt');
var proxy = require('./router/proxy');
var auth = require('./auth/auth');
var disc = require('./router/servicedisc');
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

app.use(express.static('public'));  
app.use(bodyParser.json({limit:'5mb'}));    
app.use(bodyParser.urlencoded({extended:true, limit:'5mb'}));  
app.use(bodyParser.text());                                    
app.use(bodyParser.json({ type: 'application/json'}));
app.use(cors())

//middleware
//app.use(disc.serviceExists);
app.use(auth.checkAuthToken);

//##################### --- Service Management ----##############
//api for get data from database  
app.get("/services/service",servicemgmt.getAllServices);
    
//api for Delete data from database  
app.delete("/services/service/:name",servicemgmt.deleteService);
    
//api for Update data from database  
app.put("/services/service",servicemgmt.updateService);
    
//api for Insert data from database  
app.post("/services/service",servicemgmt.saveService);

//get a service
app.get("/services/getservice/:name",servicemgmt.getService);


//############### Routing Service Calls ################################
app.get("/api/:servicename/:path*",proxy.getProxy);
app.put("/api/:servicename/:path*",proxy.putProxy);
app.post("/api/:servicename/:path*",proxy.postProxy);
app.delete("/api/:servicename/:path*",proxy.deleteProxy);
////#########---End Routing Service calls------##########

//#region Service Health Check
//start server on port  
http.listen(port,function(){   
    console.log("server started on port "+ port);  
})
/*io.set("origins", "*:*");
io.on("connection", socket => {
    console.log("New client connected"), setInterval(
      () => checkIsAlive(socket),
      4000
    );
    //socket.on("disconnect", () => console.log("Client disconnected"));
  });
const checkIsAlive = async socket => {
  try {
        serviceModel.find({},function(err,data){  
            if(err){  
                console.error(`Error: ${error}`);
            }  
            else{
                data.forEach(element => {
                    axios.get(element.serviceEndpoint + element.path + "/isAlive")
                    .then(response =>  {
                        if(response.data.alive===true){
                            socket.emit("isAlive", 'alive');
                        }else{
                            socket.emit("isAlive", 'dead');
                        }
                    }).catch((err) => {
                        console.log(err);
                    });
                });             
            }  
        });  
        
    } catch (error) {
        console.error(`Error: ${error.code}`);
    }
};
*/
//#endregion  
