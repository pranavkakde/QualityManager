var table = require('cachejsorm').TableSchema
var tableMapping = require('cachejsorm').TableMapper

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