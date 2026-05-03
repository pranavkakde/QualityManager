var table = require('../../shared/orm.js').TableSchema
var tableMapping = require('../../shared/orm.js').TableMapper

var tableName ='dbo.[projectreleases]';
var schema = new table(
    {
        projectreleaseid: {type: Number}, 
        releaseid : {type:Number},
        projectid : {type:Number}
    }
);
var projectReleaseModel = new tableMapping(tableName, schema);
module.exports=projectReleaseModel;