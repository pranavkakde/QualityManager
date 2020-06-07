const { body, param } = require('express-validator')

exports.validate = (method) => {
    switch (method) {
      case 'gettoken':{
        return [
            body('username',  'Client Name doesn\'t exists').exists(),
            body('password',  'Password doesn\'t exists').exists()
          ]   
      }
      case 'validatetoken':{
        return [
            body('token',  'token doesn\'t exists').exists(), 
          ]   
      }
    }
  }