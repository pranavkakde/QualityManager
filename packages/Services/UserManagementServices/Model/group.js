var table = require('../../shared/orm.js').TableSchema
var tableMapping = require('../../shared/orm.js').TableMapper

var tableName ='dbo.[UserGroup]';
var schema = new table(
    {
        GroupId: {type: Number}, 
        GroupName: {type: String},
        IsAdmin:{type: Boolean}
    }
);
var groupModel = new tableMapping(tableName, schema);
module.exports = groupModel;