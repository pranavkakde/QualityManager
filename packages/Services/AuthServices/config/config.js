var config={
    database:{
        driverType: "mssql",    
        server:process.env.DBINSTANCE,
        database:process.env.DATABASE,
        cacheDuration: 10,
        username:process.env.DBUSER,
        password:process.env.DBPASSWORD,
        driverOptions:{
            trustedConnection: false
        }
    },
    services:{
        clients_services:`${process.env.CLIENT_SERVICES_URL}/`
    },
    authkey:{
        key: 'clientkey'
    }
}
module.exports = config;