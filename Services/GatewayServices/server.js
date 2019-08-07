var express = require("express");  
var path = require("path");  
var bodyParser = require('body-parser');   
var db = require("./config.js");  
const cors = require('cors')  
var app = express();  
var port = process.env.PORT || '10104'  
var testRunModel = require('./Model/TestRun')
var serviceModel = require('./Model/Service')
var morgan = require('morgan')
var rfs = require("rotating-file-stream");
var apiHandler=require('./router/router');

var http = require('http').Server(app);
var io = require('socket.io')(http);

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

//#$################### ---TestRun ----##############
//api for get data from database  
app.get("/services/service",function(req,res){   
    serviceModel.find({},function(err,data){  
            if(err){  
                res.send(err);  
            }  
            else{             
                res.send(data);  
                }  
        });  
})  
    
//api for Delete data from database  
app.delete("/services/service/:name",function(req,res){   
    console.log(req.params.name)
    serviceModel.deleteOne({ name: req.params.name }, function(err) {  
            if(err){  
                res.send(err);  
            }  
            else{    
                   res.send({data:"Service has been deleted from registry..!!"});             
               }  
        });  
})  
    
//api for Update data from database  
app.put("/services/service",function(req,res){ 
    serviceModel.findOneAndUpdate(
        {_id:req.body._id}, 
        { name:  req.body.name, 
            serviceEndpoint: req.body.serviceEndpoint, 
            path: req.body.path, 
        },
        {new:true},
        (err,doc)=> {  
        if (err) {  
            res.send(err);  
            return;  
        }  
        res.send({success:true,data:"Service data has been successfully inserted..!!",doc});  
    });  
})    
    
//api for Insert data from database  
app.post("/services/service",function(req,res){   
    var mod = new serviceModel(req.body);  
        mod.save(function(err,data){  
            if(err){  
                res.send(err);                
            }  
            else{        
                 res.send({data:"Service Record has been Inserted..!!"});  
            }  
        });  
})
app.get("/services/getservice/:name",function(req,res){   
    serviceModel.find({name: req.params.name},function(err,data){  
            if(err){  
                res.send(err);  
            }  
            else{             
                res.send(data);  
                }  
        });  
}) 

app.get("/api/:servicename/:path*",function(req,res){   
    console.log(req.params.path);
    serviceModel.findOne({name:req.params.servicename},function(err,data){
        if (err){
            var err = "Service name " + req.params.servicename + " not found in gateway registry"
            res.send({err});
        }else{
            if (data!=null){
                const uri = data.serviceEndpoint + "/"+ req.params.servicename +"/"+ req.params.path;
                console.log(uri);
                apiHandler(uri)
                    .then(response => {
                        res.json(response)
                    })
                    .catch(error => {
                        res.send(error)
                    })
            }
        }
    })
})
app.delete("/api/:servicename/:path*",function(req,res){   
    console.log(req.params.path);
    serviceModel.findOne({name:req.params.servicename},function(err,data){
        if (err){
            var err = "Service name " + req.params.servicename + " not found in gateway registry"
            res.send({err});
        }else{
            if (data!=null){
                const uri = data.serviceEndpoint + "/"+ req.params.servicename +"/"+ req.params.path;
                console.log(uri);
                apiHandler(uri)
                    .then(response => {
                        res.json(response)
                    })
                    .catch(error => {
                        res.send(error)
                    })
            }
        }
    })
})
////#########---End Services------##########

//const server = http.createServer(app);

//const io = socketIo(server);
//io.listen(10100);
//start server on port  
http.listen(port,function(){   
    console.log("server started on port "+ port);  
})
io.set("origins", "*:*");
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
  