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

        // 1. Add tag column to dbo.testcases
        console.log('Adding tag column to dbo.testcases table if it doesn\'t exist...');
        await sequelize.query(`
            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.testcases') AND name = 'tag')
            BEGIN
                ALTER TABLE [dbo].[testcases] ADD [tag] NVARCHAR(MAX) NULL;
                PRINT 'Column [tag] added to [dbo].[testcases].';
            END
            ELSE
            BEGIN
                PRINT 'Column [tag] already exists in [dbo].[testcases].';
            END
        `);

        // 2. Add tag column to dbo.testcaseversions
        console.log('Adding tag column to dbo.testcaseversions table if it doesn\'t exist...');
        await sequelize.query(`
            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.testcaseversions') AND name = 'tag')
            BEGIN
                ALTER TABLE [dbo].[testcaseversions] ADD [tag] NVARCHAR(MAX) NULL;
                PRINT 'Column [tag] added to [dbo].[testcaseversions].';
            END
            ELSE
            BEGIN
                PRINT 'Column [tag] already exists in [dbo].[testcaseversions].';
            END
        `);

        // 3. Add testsuiteid column to dbo.testrun
        console.log('Adding testsuiteid column to dbo.testrun table if it doesn\'t exist...');
        await sequelize.query(`
            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.testrun') AND name = 'testsuiteid')
            BEGIN
                ALTER TABLE [dbo].[testrun] ADD [testsuiteid] INT NULL;
                PRINT 'Column [testsuiteid] added to [dbo].[testrun].';
            END
            ELSE
            BEGIN
                PRINT 'Column [testsuiteid] already exists in [dbo].[testrun].';
            END
        `);

        // 4. Add foreign key to dbo.testrun for testsuiteid
        console.log('Adding Foreign Key FK_testrun_testsuites to dbo.testrun table...');
        await sequelize.query(`
            IF NOT EXISTS (
                SELECT * FROM sys.foreign_keys 
                WHERE name = 'FK_testrun_testsuites' AND parent_object_id = OBJECT_ID('dbo.testrun')
            )
            BEGIN
                ALTER TABLE [dbo].[testrun]
                ADD CONSTRAINT FK_testrun_testsuites 
                FOREIGN KEY (testsuiteid) REFERENCES [dbo].[testsuites](testsuiteid) ON DELETE SET NULL;
                PRINT 'Foreign key FK_testrun_testsuites added successfully.';
            END
            ELSE
            BEGIN
                PRINT 'Foreign key FK_testrun_testsuites already exists.';
            END
        `);

        // 5. Add status column to dbo.testrun
        console.log('Adding status column to dbo.testrun table if it doesn\'t exist...');
        await sequelize.query(`
            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.testrun') AND name = 'status')
            BEGIN
                ALTER TABLE [dbo].[testrun] ADD [status] NVARCHAR(50) NULL DEFAULT 'New';
                PRINT 'Column [status] added to [dbo].[testrun].';
            END
            ELSE
            BEGIN
                PRINT 'Column [status] already exists in [dbo].[testrun].';
            END
        `);

        // 6. Create dbo.testruncases table if it doesn't exist
        console.log('Creating dbo.testruncases table if it doesn\'t exist...');
        await sequelize.query(`
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'testruncases' AND schema_id = SCHEMA_ID('dbo'))
            BEGIN
                CREATE TABLE [dbo].[testruncases] (
                    [id] INT IDENTITY(1,1) PRIMARY KEY,
                    [testrunid] INT NOT NULL,
                    [testcaseid] INT NOT NULL,
                    [status] NVARCHAR(50) DEFAULT 'New',
                    CONSTRAINT FK_testruncases_testrun FOREIGN KEY (testrunid) REFERENCES [dbo].[testrun](testrunid) ON DELETE CASCADE,
                    CONSTRAINT FK_testruncases_testcase FOREIGN KEY (testcaseid) REFERENCES [dbo].[testcases](testcaseid) ON DELETE CASCADE
                );
                PRINT 'Table [dbo].[testruncases] created successfully.';
            END
            ELSE
            BEGIN
                PRINT 'Table [dbo].[testruncases] already exists.';
            END
        `);

        // 7. Create dbo.testrunsteps table if it doesn't exist
        console.log('Creating dbo.testrunsteps table if it doesn\'t exist...');
        await sequelize.query(`
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'testrunsteps' AND schema_id = SCHEMA_ID('dbo'))
            BEGIN
                CREATE TABLE [dbo].[testrunsteps] (
                    [id] INT IDENTITY(1,1) PRIMARY KEY,
                    [testrunid] INT NOT NULL,
                    [testcaseid] INT NOT NULL,
                    [stepid] INT NOT NULL,
                    [statusid] INT NOT NULL,
                    CONSTRAINT FK_testrunsteps_testrun FOREIGN KEY (testrunid) REFERENCES [dbo].[testrun](testrunid) ON DELETE CASCADE,
                    CONSTRAINT FK_testrunsteps_testcase FOREIGN KEY (testcaseid) REFERENCES [dbo].[testcases](testcaseid) ON DELETE CASCADE,
                    CONSTRAINT FK_testrunsteps_teststep FOREIGN KEY (stepid) REFERENCES [dbo].[teststeps](stepid) ON DELETE CASCADE,
                    CONSTRAINT FK_testrunsteps_stepstatus FOREIGN KEY (statusid) REFERENCES [dbo].[stepstatus](id)
                );
                PRINT 'Table [dbo].[testrunsteps] created successfully.';
            END
            ELSE
            BEGIN
                PRINT 'Table [dbo].[testrunsteps] already exists.';
            END
        `);

        // 8. Update all existing runs to have status = 'New' if they are null
        console.log('Ensuring all existing test runs have a default status...');
        await sequelize.query(`
            UPDATE [dbo].[testrun]
            SET [status] = 'New'
            WHERE [status] IS NULL;
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
