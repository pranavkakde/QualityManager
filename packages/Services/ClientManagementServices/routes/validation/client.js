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
            //param('clientid', 'Client Id parameter must be an integer').isInt(), 
            param('clientname', 'Client Name doesn\'t exists').exists(),
            body('secretkey', 'Secret Key doesn\'t exists').exists()
            ]   
      }
      case 'getClient':{
        return [
          //param('clientname',  'Client Id parameter must be an integer').isInt()
          param('clientname',  'Client Name parameter must be present').exists()
            ]   
      }
      case 'deleteClient':{
        return [
          param('clientname',  'Client Name parameter must be an integer').exists()
            ]   
      }
      /*case 'gettoken':{
        return [
            body('clientname',  'Client Name doesn\'t exists').exists()
            //body('secretkey',  'Secret Key doesn\'t exists').exists()
          ]   
      }
      case 'validatetoken':{
        return [
            body('token',  'token doesn\'t exists').exists(), 
          ]   
      }*/
    }
  }