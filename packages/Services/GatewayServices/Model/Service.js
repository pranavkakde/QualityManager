var table = require('../../shared/orm.js').TableSchema
var tableMapping = require('../../shared/orm.js').TableMapper

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