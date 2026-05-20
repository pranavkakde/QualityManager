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

        // 1. Create defectstatus table if it doesn't exist
        console.log(`Creating dbo.defectstatus table if it doesn't exist...`);
        await sequelize.query(`
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'defectstatus' AND schema_id = SCHEMA_ID('dbo'))
            BEGIN
                CREATE TABLE [dbo].[defectstatus] (
                    [defectstatusid] INT PRIMARY KEY,
                    [defectstatus] NVARCHAR(50) NOT NULL
                );
                PRINT 'Table [dbo].[defectstatus] created successfully.';
            END
            ELSE
            BEGIN
                PRINT 'Table [dbo].[defectstatus] already exists.';
            END
        `);

        // 2. Seed/Merge standard statuses
        console.log('Seeding standard status values into dbo.defectstatus...');
        await sequelize.query(`
            MERGE [dbo].[defectstatus] AS target
            USING (
                SELECT 1 AS defectstatusid, N'New' AS defectstatus UNION ALL
                SELECT 2, N'In Progress' UNION ALL
                SELECT 3, N'Fixed' UNION ALL
                SELECT 4, N'Retest Pass' UNION ALL
                SELECT 5, N'Retest Failed' UNION ALL
                SELECT 6, N'Closed' UNION ALL
                SELECT 7, N'Cancelled' UNION ALL
                SELECT 8, N'Reopened'
            ) AS source
            ON (target.defectstatusid = source.defectstatusid)
            WHEN NOT MATCHED THEN
                INSERT (defectstatusid, defectstatus) VALUES (source.defectstatusid, source.defectstatus)
            WHEN MATCHED AND target.defectstatus <> source.defectstatus THEN
                UPDATE SET defectstatus = source.defectstatus;
            PRINT 'Statuses seeded successfully.';
        `);

        // 3. Add Foreign Key reference constraint to dbo.defects
        console.log('Adding Foreign Key constraint FK_defects_defectstatus to dbo.defects table...');
        await sequelize.query(`
            IF NOT EXISTS (
                SELECT * FROM sys.foreign_keys 
                WHERE name = 'FK_defects_defectstatus' AND parent_object_id = OBJECT_ID('dbo.defects')
            )
            BEGIN
                ALTER TABLE [dbo].[defects]
                ADD CONSTRAINT FK_defects_defectstatus 
                FOREIGN KEY (defectstatusid) REFERENCES [dbo].[defectstatus](defectstatusid);
                PRINT 'Foreign key FK_defects_defectstatus added successfully.';
            END
            ELSE
            BEGIN
                PRINT 'Foreign key FK_defects_defectstatus already exists.';
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
