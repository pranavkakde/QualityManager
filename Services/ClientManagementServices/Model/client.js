var table = require('cachejsorm').TableSchema
var tableMapping = require('cachejsorm').TableMapper

var tableName ='dbo.[Clients]';
var schema = new table(
    {
        ClientId: {type: Number}, 
        ClientName: {type: String},
        SecretKey: {type: String},
        token: {type: String}
    }
);
var clientModel = new tableMapping(tableName, schema);
module.exports = clientModel;