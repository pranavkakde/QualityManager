var table = require('cachejsorm').TableSchema
var tableMapping = require('cachejsorm').TableMapper

var tableName ='dbo.[testsuites]';
var schema = new table(
    {
        testsuiteid: {type: Number}, 
        name: {type: String},
        description: {type: String}, 
        statusid : {type:Number},
        releaseid : {type:Number}
    }
);
var suiteModel = new tableMapping(tableName, schema);
module.exports=suiteModel;