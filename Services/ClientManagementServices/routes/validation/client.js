const { body, param } = require('express-validator')

exports.validate = (method) => {
    switch (method) {
      case 'addClient': {
       return [ 
          body('clientname', 'Client Name doesn\'t exists').exists(),
          body('secretkey', 'Secret Key doesn\'t exists').exists()
         ]   
      }
      case 'updateClient':{
        return [
            param('clientid', 'Client Id parameter must be an integer').isInt(), 
            body('clientname', 'Client Name doesn\'t exists').exists(),
            body('secretkey', 'Secret Key doesn\'t exists').exists()
            ]   
      }
      case 'getClient':{
        return [
          param('clientid',  'Client Id parameter must be an integer').isInt(),
          param('clientid',  'Client Id parameter must be present').exists()
            ]   
      }
      case 'deleteClient':{
        return [
          param('clientid',  'Client Id parameter must be an integer').isInt()
            ]   
      }
      case 'gettoken':{
        return [
            body('clientid',  'Client Id doesn\'t exists').exists(), 
            body('clientname',  'Client Name doesn\'t exists').exists(),
            body('secretkey',  'Secret Key doesn\'t exists').exists()
          ]   
      }
      case 'validatetoken':{
        return [
            body('token',  'token doesn\'t exists').exists(), 
          ]   
      }
    }
  }