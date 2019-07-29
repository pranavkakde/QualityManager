const { body, param } = require('express-validator/check')

exports.validate = (method) => {
    switch (method) {
      case 'addUser': {
       return [ 
          body('UserName', 'UserName doesn\'t exists').exists(),
          body('Password', 'Invalid email').exists().isEmail(),
          body('GroupId', 'group id field is missing').required().isInt(),
         ]   
      }
      case 'updateUser':{
        return [
            param('userid', 'userid parameter is required').required().isInt(), 
            body('UserName', 'UserName doesn\'t exists').exists(),
            body('Password', 'Invalid email').exists().isEmail(),
            body('GroupId', 'Group id field is required').required().isInt(),
            ]   
      }
      case 'getUser':{
        return [
            param('userid',  'userid parameter is missing').required().isInt(), 
            ]   
      }
      case 'deleteUser':{
        return [
            param('userid',  'userid parameter is missing').required().isInt(), 
            ]   
      }
    }
  }