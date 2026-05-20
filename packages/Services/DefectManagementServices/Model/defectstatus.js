var table = require('../../shared/orm.js').TableSchema;
var tableMapping = require('../../shared/orm.js').TableMapper;

var tableName = 'dbo.[defectstatus]';
var schema = new table(
    {
        defectstatusid: { type: Number },
        defectstatus: { type: String }
    }
);
var defectStatusModel = new tableMapping(tableName, schema);
module.exports = defectStatusModel;
