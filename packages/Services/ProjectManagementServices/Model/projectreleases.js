var table = require('cachejsorm').TableSchema
var tableMapping = require('cachejsorm').TableMapper

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