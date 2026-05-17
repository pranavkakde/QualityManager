var table = require('../../shared/orm.js').TableSchema
var tableMapping = require('../../shared/orm.js').TableMapper

var tableName ='dbo.[testcasesuite]';
var schema = new table(
    {
        id: {type: Number}, 
        testcaseid : {
            type: Number,
            references: { model: 'testcases', key: 'testcaseid' }
        },
        testsuiteid : {
            type: Number,
            references: { model: 'testsuites', key: 'testsuiteid' }
        }
    }
);
var suitecaseModel = new tableMapping(tableName, schema);
module.exports=suitecaseModel;