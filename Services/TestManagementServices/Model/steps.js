var table = require('cachejsorm').TableSchema
var tableMapping = require('cachejsorm').TableMapper

var tableName ='dbo.[teststeps]';
var schema = new table(
    {
        stepid: {type: Number}, 
        stepname: {type: String},
        action: {type: String},
        verification: {type: String},
        testcaseid: {type: Number},
        statusid: {type: Number}
    }
);
var stepModel = new tableMapping(tableName, schema);
module.exports=stepModel;