var table = require('../../shared/orm.js').TableSchema
var tableMapping = require('../../shared/orm.js').TableMapper

var tableName ='dbo.[testcases]';
var schema = new table(
    {
        testcaseid: {type: Number}, 
        name: {type: String},
        description: {type: String},
        versionid: {type: String},
        prerequisite: {type: String},
        statusid: {type: Number},
        author: {type: Number}
    }
);
var testModel = new tableMapping(tableName, schema);
module.exports=testModel;