var table = require('../../shared/orm.js').TableSchema
var tableMapping = require('../../shared/orm.js').TableMapper

var tableName ='dbo.[testrunsteps]';
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
        stepid: {
            type: Number,
            references: { model: 'teststeps', key: 'stepid' }
        },
        statusid: {
            type: Number,
            references: { model: 'stepstatus', key: 'id' }
        }
    }
);
var testModel = new tableMapping(tableName, schema);
module.exports=testModel;
