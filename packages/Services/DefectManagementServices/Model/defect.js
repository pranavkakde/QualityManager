var table = require('cachejsorm').TableSchema
var tableMapping = require('cachejsorm').TableMapper

var tableName ='dbo.[defects]';
var schema = new table(
    {
        defectid: {type: Number}, 
        subject: {type: String},
        description: {type: String}, 
        assignedto : {type:Number},
        createdby : {type:Number},
        createddate : {type:String},
        defectstatusid : {type:Number},
        closedby : {type:Number}
    }
);
var defectModel = new tableMapping(tableName, schema);
module.exports=defectModel;