const { body, param } = require('express-validator')

exports.validate = (method) => {
    switch (method) {
      case 'addCase': {
       return [ 
            param('testsuiteid', 'Test Suite Id parameter is required').exists(),
            param('releaseid', 'Release Id parameter is required').exists()
         ]   
      }
      case 'updateCase':{
        return [
            param('releasesuiteid', 'Release Suite Id parameter is required').exists(), 
            body('testsuiteid', 'Test Suite Id is required').exists(),
            body('releaseid', 'Release Id is required').exists()
            ]   
      }
      case 'getCase':{
        return [
            param('testsuiteid', 'Test Suite Id parameter is required').exists(),
            param('releaseid', 'Release Id parameter is required').exists()
            ]   
      }
      case 'deleteCase':{
        return [
            param('testsuiteid', 'Test Suite Id parameter is required').exists(),
            param('releaseid', 'Release Id parameter is required').exists()
            ]   
      }
    }
  }