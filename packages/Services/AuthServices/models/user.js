var table = require('../../shared/orm.js').TableSchema
var tableMapping = require('../../shared/orm.js').TableMapper

var tableName = 'dbo.[UserProfile]';
var schema = new table(
    {
        UserId: { type: Number },
        UserName: { type: String },
        Password: { type: String },
        GroupId: { 
            type: Number,
            references: {
                model: 'UserGroup', // Matches the tableName of UserGroup model
                key: 'GroupId'      // Matches the column in the UserGroup table
            }
        }
    }
);
var userModel = new tableMapping(tableName, schema);
module.exports = userModel;