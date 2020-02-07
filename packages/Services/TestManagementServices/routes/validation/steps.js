const { body, param } = require('express-validator')

exports.validate = (method) => {
    switch (method) {
      case 'addTestStep': {
       return [ 
        body('stepname', 'Test Step Name doesn\'t exists').exists(),
        body('action', 'Step Action doesn\'t exists').exists(),
        body('verification', 'Step Verification doesn\'t exists').exists(),
        body('statusid', 'Step Status Id doesn\'t exists').exists(),
        param('testcaseid', 'Test Case Id parameter does not contains correct data').exists().isNumeric()
     ]   
      }
      case 'updateTestStep':{
        return [
            body('stepname', 'Test Step Name doesn\'t exists').exists(),
            body('action', 'Step Action doesn\'t exists').exists(),
            body('verification', 'Step Verification doesn\'t exists').exists(),
            body('statusid', 'Step Status Id doesn\'t exists').exists(),
            param('testcaseid',  'Test Case Id parameter does not contains correct data').exists().isNumeric(),
            param('stepid',  'Test Step Id parameter does not contains correct data').exists().isNumeric()
        ]   
      }
      case 'getTestStep':{
        return [
            param('testcaseid',  'Test Case Id parameter does not contains correct data').exists().isNumeric(),
            param('stepid',  'Test Step Id parameter does not contains correct data').exists().isNumeric()
            ]   
      }
      case 'deleteTestStep':{
        return [
            param('testcaseid',  'Test Case Id parameter does not contains correct data').exists().isNumeric(),
            param('stepid',  'Test Step Id parameter does not contains correct data').exists().isNumeric()
            ]   
      }
      case 'getAllSteps':{
        return [
            param('testcaseid',  'Test Case Id parameter does not contains correct data').isNumeric(),
        ]
      }
    }
  }