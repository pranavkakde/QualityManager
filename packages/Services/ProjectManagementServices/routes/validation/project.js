const { body, param } = require('express-validator')

exports.validate = (method) => {
    switch (method) {
      case 'addProject': {
       return [ 
          body('name', 'Project Name doesn\'t exists').exists(),
          body('description', 'Project Description doesn\'t exists').exists()
         ]   
      }
      case 'updateProject':{
        return [
            param('projectid', 'Project Id parameter is required').exists(), 
            body('name', 'Project Name doesn\'t exists').exists(),
            body('description', 'Project Description doesn\'t exists').exists()
            ]   
      }
      case 'getProject':{
        return [
            param('projectid',  'Project Id parameter is missing').exists() 
            ]   
      }
      case 'deleteProject':{
        return [
            param('projectid',  'Project Id parameter is missing').exists() 
            ]   
      }
    }
  }