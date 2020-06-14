const { body, param } = require('express-validator')

exports.validate = (method) => {
    switch (method) {
      case 'addGroup': {
       return [ 
          //body('groupid', 'Group Id doesn\'t exists').exists(),
          body('groupname', 'Group Name doesn\'t exists').exists()
         ]   
      }
      case 'updateGroup':{
        return [
            param('groupid', 'Group Id doesn\'t exists').exists(),
            param('groupid', 'Group Id should be an integer').isInt(),
            body('groupname', 'Group Name doesn\'t exists').exists()
            ]   
      }
      case 'getGroup':{
        return [
            param('groupid',  'Group Id parameter is missing').exists(), 
            param('groupid',  'Group Id should be an integer').isInt()
            ]   
      }
      case 'deleteGroup':{
        return [
            param('groupid',  'Group Id parameter is missing').exists(), 
            param('groupid',  'Group Id should be an integer').isInt()
            ]   
      }
    }
  }