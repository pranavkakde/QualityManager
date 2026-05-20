var table = require('../../shared/orm.js').TableSchema;
var tableMapping = require('../../shared/orm.js').TableMapper;

var tableName = 'dbo.[defecttestcase]';
var schema = new table(
    {
        id: { type: Number },
        defectid: { 
            type: Number, 
            references: { model: 'defects', key: 'defectid' } 
        },
        testsuiteid: { 
            type: Number, 
            references: { model: 'testsuites', key: 'testsuiteid' } 
        },
        testcaseid: { 
            type: Number, 
            references: { model: 'testcases', key: 'testcaseid' } 
        }
    }
);
var defectTestCaseModel = new tableMapping(tableName, schema);
module.exports = defectTestCaseModel;
