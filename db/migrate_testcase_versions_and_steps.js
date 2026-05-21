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

        // 1. Add peer review statuses to dbo.TestCaseStatus
        console.log('Inserting peer review statuses into dbo.TestCaseStatus...');
        await sequelize.query(`
            MERGE [dbo].[TestCaseStatus] AS target
            USING (
                SELECT 1 AS statusid, N'New' AS statusname UNION ALL
                SELECT 2, N'In Progress' UNION ALL
                SELECT 3, N'Passed' UNION ALL
                SELECT 4, N'Failed' UNION ALL
                SELECT 5, N'Blocked' UNION ALL
                SELECT 6, N'On Hold' UNION ALL
                SELECT 7, N'In Review' UNION ALL
                SELECT 8, N'Reviewed'
            ) AS source
            ON (target.statusid = source.statusid)
            WHEN NOT MATCHED THEN
                INSERT (statusid, statusname) VALUES (source.statusid, source.statusname)
            WHEN MATCHED AND target.statusname <> source.statusname THEN
                UPDATE SET statusname = source.statusname;
            PRINT 'TestCaseStatus seeded successfully.';
        `);

        // 2. Create dbo.stepstatus table if it doesn't exist
        console.log(`Creating dbo.stepstatus table if it doesn't exist...`);
        await sequelize.query(`
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'stepstatus' AND schema_id = SCHEMA_ID('dbo'))
            BEGIN
                CREATE TABLE [dbo].[stepstatus] (
                    [id] INT PRIMARY KEY,
                    [status] NVARCHAR(50) NOT NULL
                );
                PRINT 'Table [dbo].[stepstatus] created successfully.';
            END
            ELSE
            BEGIN
                PRINT 'Table [dbo].[stepstatus] already exists.';
            END
        `);

        // 3. Seed stepstatus values
        console.log('Seeding standard status values into dbo.stepstatus...');
        await sequelize.query(`
            MERGE [dbo].[stepstatus] AS target
            USING (
                SELECT 1 AS id, N'New' AS status UNION ALL
                SELECT 2, N'Pass' UNION ALL
                SELECT 3, N'Failed' UNION ALL
                SELECT 4, N'Blocked' UNION ALL
                SELECT 5, N'Complete' UNION ALL
                SELECT 6, N'On Hold'
            ) AS source
            ON (target.id = source.id)
            WHEN NOT MATCHED THEN
                INSERT (id, status) VALUES (source.id, source.status)
            WHEN MATCHED AND target.status <> source.status THEN
                UPDATE SET status = source.status;
            PRINT 'stepstatus values seeded successfully.';
        `);

        // 4. Update existing invalid statusid values in teststeps to 'New' (1) before constraint creation
        console.log('Cleaning up statusid in dbo.teststeps table...');
        await sequelize.query(`
            UPDATE [dbo].[teststeps]
            SET [statusid] = 1
            WHERE [statusid] IS NULL OR [statusid] NOT BETWEEN 1 AND 6;
        `);

        // 5. Add Foreign Key reference constraint to dbo.teststeps
        console.log('Adding Foreign Key constraint FK_teststeps_stepstatus to dbo.teststeps table...');
        await sequelize.query(`
            IF NOT EXISTS (
                SELECT * FROM sys.foreign_keys 
                WHERE name = 'FK_teststeps_stepstatus' AND parent_object_id = OBJECT_ID('dbo.teststeps')
            )
            BEGIN
                ALTER TABLE [dbo].[teststeps]
                ADD CONSTRAINT FK_teststeps_stepstatus 
                FOREIGN KEY (statusid) REFERENCES [dbo].[stepstatus](id);
                PRINT 'Foreign key FK_teststeps_stepstatus added successfully.';
            END
            ELSE
            BEGIN
                PRINT 'Foreign key FK_teststeps_stepstatus already exists.';
            END
        `);

        // 6. Create dbo.testcaseversions table if it doesn't exist
        console.log(`Creating dbo.testcaseversions table if it doesn't exist...`);
        await sequelize.query(`
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'testcaseversions' AND schema_id = SCHEMA_ID('dbo'))
            BEGIN
                CREATE TABLE [dbo].[testcaseversions] (
                    [id] INT IDENTITY(1,1) PRIMARY KEY,
                    [testcaseid] INT NOT NULL,
                    [name] NVARCHAR(MAX),
                    [description] NVARCHAR(MAX),
                    [versionid] NVARCHAR(MAX),
                    [prerequisite] NVARCHAR(MAX),
                    [statusid] INT,
                    [author] INT,
                    [createdat] DATETIME DEFAULT GETDATE(),
                    CONSTRAINT FK_testcaseversions_testcase FOREIGN KEY (testcaseid) REFERENCES [dbo].[testcases](testcaseid) ON DELETE CASCADE,
                    CONSTRAINT FK_testcaseversions_author FOREIGN KEY (author) REFERENCES [dbo].[UserProfile](UserId),
                    CONSTRAINT FK_testcaseversions_status FOREIGN KEY (statusid) REFERENCES [dbo].[TestCaseStatus](statusid)
                );
                PRINT 'Table [dbo].[testcaseversions] created successfully.';
            END
            ELSE
            BEGIN
                PRINT 'Table [dbo].[testcaseversions] already exists.';
            END
        `);

        // 7. Seed initial versions (v1) for any existing testcases that do not have any archived versions
        console.log('Archiving initial v1 versions for existing test cases...');
        await sequelize.query(`
            INSERT INTO [dbo].[testcaseversions] (testcaseid, name, description, versionid, prerequisite, statusid, author)
            SELECT testcaseid, name, description, COALESCE(NULLIF(versionid, ''), 'v1'), prerequisite, statusid, author
            FROM [dbo].[testcases] AS tc
            WHERE NOT EXISTS (
                SELECT 1 FROM [dbo].[testcaseversions] AS tcv 
                WHERE tcv.testcaseid = tc.testcaseid
            );
            PRINT 'Initial testcase versions archived successfully.';
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
