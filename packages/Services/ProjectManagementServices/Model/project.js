var table = require('cachejsorm').TableSchema
var tableMapping = require('cachejsorm').TableMapper

var tableName ='dbo.[ProjectMaster]';
var schema = new table(
    {
        projectid: {type: Number}, 
        name: {type: String},
        description: {type: String} 
    }
);
var projectModel = new tableMapping(tableName, schema);
module.exports=projectModel;