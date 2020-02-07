var mongoose = require('mongoose');
var Schema = mongoose.Schema;  
//var PathSchema = new Schema({ name: String });  
var serviceSchema = new Schema({      
    name: { type: String   },       
    serviceEndpoint: { type: String   },     
    path: {type: String},
    status: {type: String}
},{ versionKey: false });  

var ServiceModel = mongoose.model('Services', serviceSchema, 'Services');  
module.exports =  ServiceModel;