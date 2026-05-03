var table = require('../../shared/orm.js').TableSchema
var tableMapping = require('../../shared/orm.js').TableMapper

var tableName ='dbo.[ReleaseMaster]';
var schema = new table(
    {
        releaseid: {type: Number}, 
        name: {type: String},
        description: {type: String},
        iscurrentrelease: {type: Boolean}
    }
);
var relModel = new tableMapping(tableName, schema);
module.exports=relModel;