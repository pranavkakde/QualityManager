const { body, param } = require('express-validator')

exports.validate = (method) => {
    switch (method) {
      case 'addRelease': {
       return [ 
          body('name', 'Test Suite doesn\'t exists').exists(),
          body('description', 'Description doesn\'t exists').exists()
         ]   
      }
      case 'updateRelease':{
        return [
            param('releaseid', 'Release Id parameter is required').exists(), 
            body('name', 'Test Suite doesn\'t exists').exists(),
            body('description', 'Description doesn\'t exists').exists()
            ]   
      }
      case 'getRelease':{
        return [
            param('releaseid',  'Release Id parameter is missing').exists() 
            ]   
      }
      case 'deleteRelease':{
        return [
            param('releaseid',  'Release Id parameter is missing').exists() 
            ]   
      }
      case 'filterReleases':{
        return [
          body('releases', 'release ids are missing').exists()
        ]
      }
    }
  }