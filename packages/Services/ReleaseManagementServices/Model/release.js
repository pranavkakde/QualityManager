var table = require('cachejsorm').TableSchema
var tableMapping = require('cachejsorm').TableMapper

var tableName ='dbo.[ReleaseMaster]';
var schema = new table(
    {
        releaseid: {type: Number}, 
        name: {type: String},
        description: {type: String} 
    }
);
var relModel = new tableMapping(tableName, schema);
module.exports=relModel;