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
        testsuite:`${process.env.TESTSUITE_URL}/`
    }
}
module.exports = config;
