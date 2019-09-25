var table = require('cachejsorm').TableSchema
var tableMapping = require('cachejsorm').TableMapper

var tableName ='dbo.[testcasesuite]';
var schema = new table(
    {
        id: {type: Number}, 
        testcaseid : {type:Number},
        testsuiteid : {type:Number}
    }
);
var suitecaseModel = new tableMapping(tableName, schema);
module.exports=suitecaseModel;