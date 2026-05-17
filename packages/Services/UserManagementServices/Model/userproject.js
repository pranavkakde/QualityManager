var table = require('../../shared/orm.js').TableSchema
var tableMapping = require('../../shared/orm.js').TableMapper

var tableName ='dbo.[UserProject]';
var schema = new table(
    {
        id: {type: Number}, 
        userid: {
            type: Number,
            references: { model: 'UserProfile', key: 'UserId' }
        },
        projectid: {
            type: Number,
            references: { model: 'ProjectMaster', key: 'projectid' }
        }
    }
);
var userProjectModel = new tableMapping(tableName, schema);
module.exports = userProjectModel;
