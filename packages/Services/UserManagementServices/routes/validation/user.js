const { body, param } = require('express-validator')

exports.validate = (method) => {
    switch (method) {
      case 'addUser': {
       return [ 
          body('username', 'UserName doesn\'t exists').exists(),
          body('password', 'Password doesn\'t exists').exists(),
          body('groupid', 'group id field is missing').exists(),
          body('groupid', 'group id field should be an integer').isInt()
         ]   
      }
      case 'updateUser':{
        return [
            param('username', 'username parameter is required').exists(), 
            body('username', 'UserName doesn\'t exists').exists(),
            body('password', 'Password doesn\'t exists').exists(),
            body('groupid', 'Group id field is required').exists(),
            body('groupid', 'group id field should be an integer').isInt()
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
      case 'login':{
        return [
          body('username', 'UserName doesn\'t exists').exists(),
          body('password', 'Password doesn\'t exists').exists(),
          ]
      }
      case 'logout': {
        return [
          body('UserName', 'UserName doesn\'t exists').exists(),
          body('Password', 'Password doesn\'t exists').exists(),
          ]
      }
    }
  }