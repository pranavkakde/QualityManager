const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('QualityManager', 'sa', 'pass123', {
    host: 'localhost',
    dialect: 'mssql',
    dialectOptions: {
        options: { instanceName: 'SQLEXPRESS', encrypt: false, trustServerCertificate: true }
    },
    logging: false
});

async function querySuiteCase() {
    try {
        await sequelize.authenticate();
        console.log('DB connection successful.');

        const [mappings] = await sequelize.query('SELECT * FROM testcasesuite');
        console.log('\nAll testcasesuite mappings:');
        console.table(mappings);

        const [testcases] = await sequelize.query('SELECT testcaseid, name FROM testcases');
        console.log('\nAll testcases:');
        console.table(testcases);
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await sequelize.close();
    }
}

querySuiteCase();
