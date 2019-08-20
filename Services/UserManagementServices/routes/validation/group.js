const { body, param } = require('express-validator')

exports.validate = (method) => {
    switch (method) {
      case 'addGroup': {
       return [ 
          body('groupname', 'Group Name doesn\'t exists').exists()
          //body('GroupId', 'group id field is missing').exists(),
         ]   
      }
      case 'updateGroup':{
        return [
            //param('userid', 'userid parameter is required').exists(), 
            param('groupname', 'GroupName doesn\'t exists').exists(),
            ]   
      }
      case 'getGroup':{
        return [
            param('groupname',  'Group Name parameter is missing').exists(), 
            ]   
      }
      case 'deleteGroup':{
        return [
            param('groupname',  'userid parameter is missing').exists(), 
            ]   
      }
    }
  }