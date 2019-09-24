const { body, param } = require('express-validator')

exports.validate = (method) => {
    switch (method) {
      case 'addSuite': {
       return [ 
          body('name', 'Test Suite doesn\'t exists').exists(),
          body('description', 'Description doesn\'t exists').exists(),
          body('statusid', 'Status Id field is missing').exists(),
          body('releaseid', 'Releaese Id field is missing').exists()
         ]   
      }
      case 'updateSuite':{
        return [
            param('testsuiteid', 'Defect Id parameter is required').exists(), 
            body('name', 'Test Suite doesn\'t exists').exists(),
            body('description', 'Description doesn\'t exists').exists(),
            body('statusid', 'Status Id field is missing').exists(),
            body('releaseid', 'Releaese Id field is missing').exists()
            ]   
      }
      case 'getSuite':{
        return [
            param('testsuiteid',  'testsuiteid parameter is missing').exists(), 
            ]   
      }
      case 'deleteSuite':{
        return [
            param('testsuiteid',  'testsuiteid parameter is missing').exists(), 
            ]   
      }
    }
  }