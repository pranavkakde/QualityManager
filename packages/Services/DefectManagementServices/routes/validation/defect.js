const { body, param } = require('express-validator')

exports.validate = (method) => {
    switch (method) {
      case 'addDefect': {
       return [ 
          body('subject', 'Subject doesn\'t exists').exists(),
          body('description', 'Description doesn\'t exists').exists(),
          body('assignedto', 'Assigned To field is missing').exists(),
          body('createdby', 'Created By field is missing').exists(),
          body('createddate', 'Created Date field is missing').exists(),
          body('defectstatusid', 'Defect Status Id field is missing').exists(),
          body('closedby', 'Closed By field is missing').exists()
         ]   
      }
      case 'updateDefect':{
        return [
            param('defectid', 'Defect Id parameter is required').exists(),
            param('defectid', 'Defect Id parameter must be greater than 0').isNumeric(), 
            body('subject', 'Subject doesn\'t exists').exists(),
            body('description', 'Description doesn\'t exists').exists(),
            body('assignedto', 'Assigned To field is missing').exists(),
            body('createdby', 'Created By field is missing').exists(),
            body('createddate', 'Created Date field is missing').exists(),
            body('defectstatusid', 'Defect Status Id field is missing').exists(),
            body('closedby', 'Closed By field is missing').exists()
            ]   
      }
      case 'getDefect':{
        return [
            param('defectid',  'defectid parameter is missing').exists(),
            param('defectid',  'defectid parameter must be greater than 0').isNumeric() 
            ]   
      }
      case 'deleteDefect':{
        return [
            param('defectid',  'defectid parameter is missing').exists(), 
            param('defectid',  'defectid parameter must be greater than 0').isNumeric()
            ]   
      }
    }
  }