const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('QualityManager', 'sa', 'pass123', {
    host: 'localhost',
    dialect: 'mssql',
    dialectOptions: {
        options: { instanceName: 'SQLEXPRESS', encrypt: false, trustServerCertificate: true }
    },
    logging: false
});

async function queryAll() {
    try {
        await sequelize.authenticate();
        console.log('Connected.');

        const [releases] = await sequelize.query('SELECT * FROM ReleaseMaster');
        console.log('\n--- ReleaseMaster ---');
        console.table(releases);

        const [suites] = await sequelize.query('SELECT * FROM testsuites');
        console.log('\n--- testsuites ---');
        console.table(suites);

        const [releasesuites] = await sequelize.query('SELECT * FROM releasesuites');
        console.log('\n--- releasesuites ---');
        console.table(releasesuites);

        const [defects] = await sequelize.query('SELECT * FROM defects');
        console.log('\n--- defects ---');
        console.table(defects);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await sequelize.close();
    }
}

queryAll();
