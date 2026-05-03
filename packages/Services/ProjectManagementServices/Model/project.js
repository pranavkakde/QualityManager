var table = require('../../shared/orm.js').TableSchema
var tableMapping = require('../../shared/orm.js').TableMapper

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