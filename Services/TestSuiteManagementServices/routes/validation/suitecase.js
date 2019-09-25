const { body, param } = require('express-validator')

exports.validate = (method) => {
    switch (method) {
      case 'addCase': {
       return [ 
            param('testsuiteid', 'Test Suite Id parameter is required').exists(),
            param('testcaseid', 'Test Case Id parameter is required').exists()
         ]   
      }
      case 'updateCase':{
        return [
            param('testcasesuiteid', 'Test Suite Case Id parameter is required').exists(), 
            body('testsuiteid', 'Test Suite Id is required').exists(),
            body('testcaseid', 'Test Case Id is required').exists()
            ]   
      }
      case 'getCase':{
        return [
            param('testsuiteid', 'Test Suite Id parameter is required').exists(),
            param('testcaseid', 'Test Case Id parameter is required').exists()
            ]   
      }
      case 'deleteCase':{
        return [
            param('testsuiteid', 'Test Suite Id parameter is required').exists(),
            param('testcaseid', 'Test Case Id parameter is required').exists()
            ]   
      }
    }
  }