var table = require('cachejsorm').TableSchema
var tableMapping = require('cachejsorm').TableMapper

var tableName ='dbo.[releasesuites]';
var schema = new table(
    {
        id: {type: Number}, 
        releaseid : {type:Number},
        testsuiteid : {type:Number}
    }
);
var releasesuiteModel = new tableMapping(tableName, schema);
module.exports=releasesuiteModel;