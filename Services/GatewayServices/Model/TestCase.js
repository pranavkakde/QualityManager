var mongoose = require('mongoose');  
var Schema = mongoose.Schema;  
var testRunSchema = new Schema({      
    TestCaseName: { type: String   },       
    TestCaseStatus: { type: String   },     
    Duration: { type: Number },       
    Message: { type: String },
    TestRunId: { type: String },
    TestSuiteName: { type: String }
},{ versionKey: false });  

var TestCaseModel = mongoose.model('TestCases', testRunSchema, 'TestCases');  
module.exports =  TestCaseModel;