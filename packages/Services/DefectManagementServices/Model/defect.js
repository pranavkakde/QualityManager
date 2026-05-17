var table = require('../../shared/orm.js').TableSchema
var tableMapping = require('../../shared/orm.js').TableMapper

var tableName ='dbo.[defects]';
var schema = new table(
    {
        defectid: {type: Number}, 
        subject: {type: String},
        description: {type: String}, 
        assignedto : {
            type: Number,
            references: { model: 'UserProfile', key: 'UserId' }
        },
        createdby : {
            type: Number,
            references: { model: 'UserProfile', key: 'UserId' }
        },
        createddate : {type:String},
        defectstatusid : {type:Number},
        closedby : {
            type: Number,
            references: { model: 'UserProfile', key: 'UserId' }
        },
        releaseid : {
            type: Number,
            references: { model: 'ReleaseMaster', key: 'releaseid' }
        }
    }
);
var defectModel = new tableMapping(tableName, schema);
module.exports=defectModel;