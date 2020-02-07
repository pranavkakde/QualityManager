var mongo = require("mongoose");  
var db =  'gateway'; 
mongo.connect("mongodb://127.0.0.1:27017/"+db, { useNewUrlParser: true }, function(err, response){  
   if(err){ console.log('Failed to connect to ' + db); }  
   else{ console.log('Connected to ' + db); }  
});  
  
  
module.exports =db;  