const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('QualityManager', 'sa', 'pass123', {
    host: 'localhost',
    dialect: 'mssql',
    dialectOptions: {
        options: { instanceName: 'SQLEXPRESS', encrypt: false, trustServerCertificate: true }
    },
    logging: false
});

async function checkTestCases() {
    try {
        await sequelize.authenticate();
        console.log('Connected to SQL Server successfully.');

        // Query testcases table
        const [testcases] = await sequelize.query('SELECT * FROM testcases');
        console.log('\n--- testcases table keys ---');
        if (testcases.length > 0) {
            console.log('Keys of first test case:', Object.keys(testcases[0]));
            console.log('First testcase object:', testcases[0]);
        } else {
            console.log('No test cases found.');
        }

        // Query testcasesuite table
        const [testcasesuite] = await sequelize.query('SELECT * FROM testcasesuite');
        console.log('\n--- testcasesuite table keys ---');
        if (testcasesuite.length > 0) {
            console.log('Keys of first testcasesuite mapping:', Object.keys(testcasesuite[0]));
            console.log('First testcasesuite mapping:', testcasesuite[0]);
        } else {
            console.log('No testcasesuite mappings found.');
        }
        
    } catch (err) {
        console.error('Error during query:', err);
    } finally {
        await sequelize.close();
    }
}

checkTestCases();
