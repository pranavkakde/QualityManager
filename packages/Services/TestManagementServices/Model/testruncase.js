var table = require('../../shared/orm.js').TableSchema
var tableMapping = require('../../shared/orm.js').TableMapper

var tableName ='dbo.[testruncases]';
var schema = new table(
    {
        id: {type: Number},
        testrunid: {
            type: Number,
            references: { model: 'testrun', key: 'testrunid' }
        },
        testcaseid: {
            type: Number,
            references: { model: 'testcases', key: 'testcaseid' }
        },
        status: {type: String}
    }
);
var testModel = new tableMapping(tableName, schema);
module.exports=testModel;
