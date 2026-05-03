var table = require('../../shared/orm.js').TableSchema
var tableMapping = require('../../shared/orm.js').TableMapper

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