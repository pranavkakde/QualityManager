var table = require('../../shared/orm.js').TableSchema
var tableMapping = require('../../shared/orm.js').TableMapper

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