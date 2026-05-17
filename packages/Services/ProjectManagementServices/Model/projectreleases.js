var table = require('../../shared/orm.js').TableSchema
var tableMapping = require('../../shared/orm.js').TableMapper

var tableName ='dbo.[projectreleases]';
var schema = new table(
    {
        projectreleaseid: {type: Number}, 
        releaseid : {
            type: Number,
            references: { model: 'ReleaseMaster', key: 'releaseid' }
        },
        projectid : {
            type: Number,
            references: { model: 'ProjectMaster', key: 'projectid' }
        }
    }
);
var projectReleaseModel = new tableMapping(tableName, schema);
module.exports=projectReleaseModel;