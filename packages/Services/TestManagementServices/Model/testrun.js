var table = require('../../shared/orm.js').TableSchema
var tableMapping = require('../../shared/orm.js').TableMapper

var tableName ='dbo.[testrun]';
var schema = new table(
    {
        testrunid: {type: Number}, 
        name: {type: String},
        runtypeid: {type: Number},
        startdate: {type: String},
        enddate: {type: String},
        userid: {
            type: Number,
            references: { model: 'UserProfile', key: 'UserId' }
        },
        testrunstatusid: {type: Number},
        testcaseid: {
            type: Number,
            references: { model: 'testcases', key: 'testcaseid' }
        },
        testsuiteid: {
            type: Number,
            references: { model: 'testsuites', key: 'testsuiteid' }
        },
        status: {type: String}
    }
);
var runModel = new tableMapping(tableName, schema);
module.exports=runModel;