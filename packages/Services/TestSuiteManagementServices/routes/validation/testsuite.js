const { body, param } = require('express-validator')

exports.validate = (method) => {
    switch (method) {
      case 'addSuite': {
       return [ 
          body('name', 'Test Suite doesn\'t exists').exists(),
          body('description', 'Description doesn\'t exists').exists(),
          body('statusid', 'Status Id field is missing').exists(),
          body('statusid', 'Status Id field should be an integer').isInt(),
          body('releaseid', 'Releaese Id field is missing').exists(),
          body('releaseid', 'Releaese Id field should be an integer').isInt()
         ]   
      }
      case 'updateSuite':{
        return [
            param('testsuiteid', 'Test Suite Id parameter is required').exists(), 
            body('name', 'Test Suite doesn\'t exists').exists(),
            body('description', 'Description doesn\'t exists').exists(),
            body('statusid', 'Status Id field is missing').exists(),
            body('statusid', 'Status Id field should be an integer').isInt(),
            body('releaseid', 'Releaese Id field is missing').exists(),
            body('releaseid', 'Releaese Id field should be an integer').isInt()
            ]   
      }
      case 'getSuite':{
        return [
            param('testsuiteid',  'testsuiteid parameter is missing').exists(), 
            param('testsuiteid',  'testsuiteid parameter should be an integer').isInt()
            ]   
      }
      case 'deleteSuite':{
        return [
            param('testsuiteid',  'testsuiteid parameter is missing').exists(), 
            param('testsuiteid',  'testsuiteid parameter should be an integer').isInt()             
            ]   
      }
      case 'filterSuites':{
        return [
          body('testsuites', 'test suite id is missing').exists()
        ]
      }
    }
  }