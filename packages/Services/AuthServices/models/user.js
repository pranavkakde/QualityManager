var table = require('cachejsorm').TableSchema
var tableMapping = require('cachejsorm').TableMapper

var tableName ='dbo.[UserProfile]';
var schema = new table(
    {
        UserId: {type: Number}, 
        UserName: {type: String},
        Password: {type: String}, 
        GroupId : {type:Number}
    }
);
var userModel = new tableMapping(tableName, schema);
module.exports=userModel;