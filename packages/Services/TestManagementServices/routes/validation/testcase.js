const { body, param } = require('express-validator')

exports.validate = (method) => {
    switch (method) {
      case 'addTestCase': {
       return [ 
        body('name', 'Test Case doesn\'t exists').exists(),
        body('description', 'Test Description doesn\'t exists').exists(),
        body('statusid', 'Test Status Id doesn\'t exists').exists(),
        body('author', 'Test Author doesn\'t exists').exists()
     ]   
      }
      case 'updateTestCase':{
        return [
            param('testcaseid', 'Test Case Id parameter is required').exists(), 
            body('name', 'Test Case doesn\'t exists').exists(),
            body('description', 'Test Description doesn\'t exists').exists(),
            body('statusid', 'Test Status Id doesn\'t exists').exists(),
            body('author', 'Test Author doesn\'t exists').exists()
            ]   
      }
      case 'getTestCase':{
        return [
            param('testcaseid',  'Test Case Id parameter is missing').exists() 
            ]   
      }
      case 'deleteTestCase':{
        return [
            param('testcaseid',  'Test Case Id parameter is missing').exists() 
            ]   
      }
      case 'filterReleases':{
        return [
          body('releases', 'release ids are missing').exists()
        ]
      }
    }
  }