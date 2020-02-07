var mongoose = require('mongoose');  
var Schema = mongoose.Schema;  
var testRunSchema = new Schema({      
    TestSuiteName: { type: String   },       
    TestSuiteStatus: { type: String   },     
    Duration: { type: Number },       
    ExecutionProfile: { type: String },
    BrowserName: { type: String },
    RunId: { type: String },
    RunDay: { type: String },
    OSName: { type: String },
    HostName: { type: String },       
},{ versionKey: false });  

var TestRunModel = mongoose.model('TestRun', testRunSchema, 'TestRun');  
module.exports =  TestRunModel;