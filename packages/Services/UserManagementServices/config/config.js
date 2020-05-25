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
    }
}
module.exports = config;