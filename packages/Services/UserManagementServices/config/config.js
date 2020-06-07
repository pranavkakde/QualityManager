var config={
    database:{
        driverType: "mssql",    
        server: process.env.DBINSTANCE,
        database:process.env.DATABASE,
        cacheDuration: 10,
        username:process.env.DBUSER,
        password:process.env.DBPASSWORD,
        port:1433,
        driverOptions:{
            trustedConnection: false
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