const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('QualityManager', 'sa', 'pass123', {
    host: 'localhost',
    dialect: 'mssql',
    dialectOptions: {
        options: { encrypt: false, trustServerCertificate: true }
    },
    logging: false
});

async function checkDb() {
    try {
        await sequelize.authenticate();
        console.log('Connection successful.');
        
        const [testsuites] = await sequelize.query('SELECT * FROM testsuites');
        console.log('\n--- testsuites table ---');
        console.table(testsuites);

        const [releasesuites] = await sequelize.query('SELECT * FROM releasesuites');
        console.log('\n--- releasesuites table ---');
        console.table(releasesuites);
        
    } catch (err) {
        console.error('DB Error:', err);
    } finally {
        await sequelize.close();
    }
}

checkDb();
