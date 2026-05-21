var table = require('../../shared/orm.js').TableSchema
var tableMapping = require('../../shared/orm.js').TableMapper

var tableName ='dbo.[testcaseversions]';
var schema = new table(
    {
        id: {type: Number},
        testcaseid: {
            type: Number,
            references: { model: 'testcases', key: 'testcaseid' }
        },
        name: {type: String},
        description: {type: String},
        versionid: {type: String},
        prerequisite: {type: String},
        statusid: {type: Number},
        author: {
            type: Number,
            references: { model: 'UserProfile', key: 'UserId' }
        },
        createdat: {type: Date},
        tag: {type: String}
    }
);
var versionModel = new tableMapping(tableName, schema);
module.exports = versionModel;
