
exports.isEmptyObject=(obj)=>{
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        return false;
      }
    }
    return true;
  }
  exports.error=(status, message )=>{
    return error = {"error":{ message,status}}     
  }