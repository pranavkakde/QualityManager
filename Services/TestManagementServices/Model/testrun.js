var table = require('cachejsorm').TableSchema
var tableMapping = require('cachejsorm').TableMapper

var tableName ='dbo.[testrun]';
var schema = new table(
    {
        testrunid: {type: Number}, 
        name: {type: String},
        runtypeid: {type: Number},
        startdate: {type: String},
        enddate: {type: String},
        userid: {type: Number},
        testrunstatusid: {type: Number},
        testcaseid: {type: Number}
    }
);
var runModel = new tableMapping(tableName, schema);
module.exports=runModel;