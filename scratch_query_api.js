const axios = require('axios');

// Note: TestSuiteManagementServices runs on port 7780 (proxied via nginx on 80)
// Since checkAuth checks JWT, but maybe isAlive or internal requests don't, 
// let's try querying both the direct service port 7780 (which bypasses gateway but has auth check)
// and mock a direct DB query to see what TestSuiteManagementServices would return.
// Let's run a direct query first using Sequelize since we already know the DB settings.

const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('QualityManager', 'sa', 'pass123', {
    host: 'localhost',
    dialect: 'mssql',
    dialectOptions: {
        options: { instanceName: 'SQLEXPRESS', encrypt: false, trustServerCertificate: true }
    },
    logging: false
});

async function queryServiceLogic() {
    try {
        await sequelize.authenticate();
        console.log('DB connection successful.');

        // Step 1: Find mappings for testsuiteid = 1 in testcasesuite
        const [mappings] = await sequelize.query('SELECT * FROM testcasesuite WHERE testsuiteid = 1');
        console.log('\nMappings in testcasesuite for suite 1:', mappings);

        if (mappings.length > 0) {
            const ids = mappings.map(item => item.testcaseid);
            console.log('Found testcaseids:', ids);

            // Step 2: Fetch testcases
            const [testcases] = await sequelize.query(`SELECT * FROM testcases WHERE testcaseid IN (${ids.join(',')})`);
            console.log('\nTest cases returned by query:', testcases);
        }
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await sequelize.close();
    }
}

queryServiceLogic();
