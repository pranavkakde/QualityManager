const { body, param } = require('express-validator')

exports.validate = (method) => {
    switch (method) {
      case 'addTestRun': {
       return [ 
        body('name', 'Test Run Name doesn\'t exists').exists(),
        body('runtypeid', 'Test Run Type id doesn\'t exists').exists(),
        body('startdate', 'Start date doesn\'t exists').exists(),
        body('enddate', 'End Date doesn\'t exists').exists(),
        body('userid', 'User Id doesn\'t exists').exists(),
        body('testrunstatusid', 'Test run status id doesn\'t exists').exists(),
        param('testcaseid', 'Test Case Id parameter does not contains correct data').exists().isNumeric()
     ]   
      }
      case 'updateTestRun':{
        return [
            body('name', 'Test Run Name doesn\'t exists').exists(),
            body('runtypeid', 'Test Run Type id doesn\'t exists').exists(),
            body('startdate', 'Start date doesn\'t exists').exists(),
            body('enddate', 'End Date doesn\'t exists').exists(),
            body('userid', 'User Id doesn\'t exists').exists(),
            body('testrunstatusid', 'Test run status id doesn\'t exists').exists(),
            param('testcaseid',  'Test Case Id parameter does not contains correct data').exists().isNumeric(),
            param('testrunid',  'Test Run Id parameter does not contains correct data').exists().isNumeric()
        ]   
      }
      case 'getTestRun':{
        return [
            param('testcaseid',  'Test Case Id parameter does not contains correct data').exists().isNumeric(),
            param('testrunid',  'Test Run Id parameter does not contains correct data').exists().isNumeric()
            ]   
      }
      case 'deleteTestRun':{
        return [
            param('testcaseid',  'Test Case Id parameter does not contains correct data').exists().isNumeric(),
            param('testrunid',  'Test Run Id parameter does not contains correct data').exists().isNumeric()
            ]   
      }
      case 'getAllRuns':{
        return [
            param('testcaseid',  'Test Case Id parameter does not contains correct data').isNumeric(),
        ]
      }
    }
  }