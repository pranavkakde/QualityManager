var serviceModel = require('../Model/Service');
var config = require('../config');

exports.serviceExists= async(req,res)=>{
    return new Promise((resolve, reject) => {        
        serviceModel.setConfig(config.database);
        var retval;        
        serviceModel.find({name:req.params.servicename},function(err,data){
            if (err){            
                var err = "Service name " + req.params.servicename + " not found in gateway registry"
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