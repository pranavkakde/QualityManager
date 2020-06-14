const { body, param } = require('express-validator')

exports.validate = (method) => {
    switch (method) {
      case 'addCase': {
       return [ 
            param('testsuiteid', 'Test Suite Id parameter is required').exists(),
            param('testcaseid', 'Test Case Id parameter is required').exists(),
            param('testsuiteid', 'Test Suite Id parameter should be an integer').isInt(),
            param('testcaseid', 'Test Case Id parameter should be an integer').isInt()            
         ]   
      }
      case 'updateCase':{
        return [
            param('testcasesuiteid', 'Test Suite Case Id parameter is required').exists(), 
            body('testsuiteid', 'Test Suite Id is required').exists(),
            body('testcaseid', 'Test Case Id is required').exists(),
            param('testcasesuiteid', 'Test Suite Case Id parameter should be an integer').isInt(), 
            body('testsuiteid', 'Test Suite Id should be an integer').isInt(),
            body('testcaseid', 'Test Case Id should be an integer').isInt()
          ]   
      }
      case 'getCase':{
        return [
            param('testsuiteid', 'Test Suite Id parameter is required').exists(),
            param('testcaseid', 'Test Case Id parameter is required').exists(),
            param('testsuiteid', 'Test Suite Id parameter should be an integer').isInt(),
            param('testcaseid', 'Test Case Id parameter should be an integer').isInt()            
            ]   
      }
      case 'deleteCase':{
        return [
            param('testsuiteid', 'Test Suite Id parameter is required').exists(),
            param('testcaseid', 'Test Case Id parameter is required').exists(),
            param('testsuiteid', 'Test Suite Id parameter should be an integer').exists(),
            param('testcaseid', 'Test Case Id parameter should be an integer').exists()            
            ]   
      }
    }
  }