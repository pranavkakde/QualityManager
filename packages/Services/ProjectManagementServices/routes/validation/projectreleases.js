const { body, param } = require('express-validator')

exports.validate = (method) => {
    switch (method) {
      case 'addCase': {
       return [ 
            param('projectid', 'Project Id parameter is required').exists(),
            param('releaseid', 'Release Id parameter is required').exists()
         ]   
      }
      case 'updateCase':{
        return [
            param('projectreleaseid', 'Project Release Id parameter is required').exists(), 
            body('projectid', 'Project Id is required').exists(),
            body('releaseid', 'Release Id is required').exists()
            ]   
      }
      case 'getCase':{
        return [
            param('projectid', 'Project Id parameter is required').exists(),
            param('releaseid', 'Release Id parameter is required').exists()
            ]   
      }
      case 'deleteCase':{
        return [
            param('projectid', 'Project Id parameter is required').exists(),
            param('releaseid', 'Release Id parameter is required').exists()
            ]   
      }
    }
  }