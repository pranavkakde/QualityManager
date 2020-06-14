var serviceModel = require('../Model/Service');
var config = require('../config');

exports.serviceExists= async(req,res)=>{
    return new Promise((resolve, reject) => {        
        serviceModel.setConfig(config.database);
        var retval;        
        serviceModel.find({name:req.params[0]},function(err,data){
            if (!(Array.isArray(data) && data.length)){
                var err = {"error": "Service name " + req.params[0] + " not found in gateway registry"}
                reject(err);
            }else{                            
                retval = data;
                testFunction(data)
            }
        });
        function testFunction(data){            
            if(data!=null){                
                resolve(data);
            }    
        }
    });

}