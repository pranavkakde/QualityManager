var table = require('../../shared/orm.js').TableSchema
var tableMapping = require('../../shared/orm.js').TableMapper

var tableName ='dbo.[UserProfile]';
var schema = new table(
    {
        UserId: {type: Number}, 
        UserName: {type: String},
        Password: {type: String}, 
        GroupId : {
            type: Number,
            references: { model: 'UserGroup', key: 'GroupId' }
        }
    }
);
var userModel = new tableMapping(tableName, schema);
module.exports=userModel;