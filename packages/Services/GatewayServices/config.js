var config={
   database:{
       driverType: "mssql",    
       server:process.env.DBINSTANCE,
       database:process.env.DATABASE,
       cacheDuration: 10,
       username:process.env.DBUSER,
       password:process.env.DBPASSWORD,
       driverOptions:{
           trustedConnection: true
       }
   },
   services:{
      auth_services:`${process.env.AUTH_SERVICES_URL}/`
   },
   authkey:{
         key: 'clientkey'
   }
}
module.exports = config;