var table = require('cachejsorm').TableSchema
var tableMapping = require('cachejsorm').TableMapper

var tableName ='dbo.[Services]';
var schema = new table(
    {
        _id: {type: String}, 
        name: {type: String},
        serviceEndpoint: {type: String}, 
        resouceName : {type:String}
    }
);
var ServiceModel = new tableMapping(tableName, schema);
module.exports=ServiceModel;