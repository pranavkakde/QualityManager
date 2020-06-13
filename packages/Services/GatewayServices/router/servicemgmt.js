var serviceModel = require('../Model/Service');
var config = require('../config');

serviceModel.setConfig(config.database);

exports.getAllServices=(req,res)=>{
    
    serviceModel.find({},function(err,data){  
        console.log(err)
        if(err){  
            res.send(err);  
        }  
        else{             
            res.send(data);  
            }  
    });
}

exports.updateService=(req,res)=>{
    serviceModel.update(
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
}

exports.saveService=(req,res)=>{
    var mod = new serviceModel(req.body);  
        mod.insert(function(err,data){  
            if(err){  
                res.send(err);                
            }  
            else{        
                 res.send({data:"Service Record has been Inserted..!!"});  
            }  
        });  
}

exports.deleteService=(req,res)=>{
    serviceModel.delete({ name: req.params.name }, function(err) {  
        if(err){  
            res.send(err);  
        }  
        else{    
               res.send({data:"Service has been deleted from registry..!!"});             
           }  
    });  
}

exports.getService=(req,res)=>{
    serviceModel.find({name: req.params.name},function(err,data){  
        if(err){  
            res.send(err);  
        }  
        else{             
            res.send(data);  
            }  
    }); 
}