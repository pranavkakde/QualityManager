const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('QualityManager', 'sa', 'pass123', {
    host: 'localhost',
    dialect: 'mssql',
    dialectOptions: {
        options: { instanceName: 'SQLEXPRESS', encrypt: false, trustServerCertificate: true }
    },
    logging: true
});

async function migrate() {
    try {
        await sequelize.authenticate();
        console.log('Database connected successfully.');

        // Create defecttestcase table if it doesn't exist
        console.log(`Creating dbo.defecttestcase table if it doesn't exist...`);
        await sequelize.query(`
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'defecttestcase' AND schema_id = SCHEMA_ID('dbo'))
            BEGIN
                CREATE TABLE [dbo].[defecttestcase] (
                    [id] INT IDENTITY(1,1) PRIMARY KEY,
                    [defectid] INT FOREIGN KEY REFERENCES [dbo].[defects]([defectid]) ON DELETE CASCADE,
                    [testsuiteid] INT FOREIGN KEY REFERENCES [dbo].[testsuites]([testsuiteid]),
                    [testcaseid] INT FOREIGN KEY REFERENCES [dbo].[testcases]([testcaseid])
                );
                PRINT 'Table [dbo].[defecttestcase] created successfully.';
            END
            ELSE
            BEGIN
                PRINT 'Table [dbo].[defecttestcase] already exists.';
            END
        `);

        console.log('Migration completed successfully!');
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    } finally {
        await sequelize.close();
    }
}

migrate();
