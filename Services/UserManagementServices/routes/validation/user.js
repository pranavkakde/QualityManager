const { body, param } = require('express-validator')

exports.validate = (method) => {
    switch (method) {
      case 'addUser': {
       return [ 
          body('UserName', 'UserName doesn\'t exists').exists(),
          body('Password', 'Invalid email').exists().isEmail(),
          body('GroupId', 'group id field is missing').exists(),
         ]   
      }
      case 'updateUser':{
        return [
            param('username', 'username parameter is required').exists(), 
            body('UserName', 'UserName doesn\'t exists').exists(),
            body('Password', 'Invalid email').exists().isEmail(),
            body('GroupId', 'Group id field is required').exists(),
            ]   
      }
      case 'getUser':{
        return [
            param('username',  'username parameter is missing').exists(), 
            ]   
      }
      case 'deleteUser':{
        return [
            param('username',  'username parameter is missing').exists(), 
            ]   
      }
    }
  }