-- SQL Server Schema generated from QualityManager cachejsorm model files

CREATE TABLE [dbo].[UserGroup] (
    [GroupId] INT IDENTITY(1,1) PRIMARY KEY,
    [GroupName] NVARCHAR(MAX),
    [IsAdmin] BIT
);

CREATE TABLE [dbo].[UserProfile] (
    [UserId] INT IDENTITY(1,1) PRIMARY KEY,
    [UserName] NVARCHAR(MAX),
    [Password] NVARCHAR(MAX),
    [GroupId] INT FOREIGN KEY REFERENCES [dbo].[UserGroup]([GroupId])
);

CREATE TABLE [dbo].[ReleaseMaster] (
    [releaseid] INT IDENTITY(1,1) PRIMARY KEY,
    [name] NVARCHAR(MAX),
    [description] NVARCHAR(MAX),
    [iscurrentrelease] BIT
);

CREATE TABLE [dbo].[ProjectMaster] (
    [projectid] INT IDENTITY(1,1) PRIMARY KEY,
    [name] NVARCHAR(MAX),
    [description] NVARCHAR(MAX)
);

CREATE TABLE [dbo].[TestSuiteStatus] (
    [statusid] INT PRIMARY KEY,
    [statusname] NVARCHAR(50) NOT NULL
);

CREATE TABLE [dbo].[TestCaseStatus] (
    [statusid] INT PRIMARY KEY,
    [statusname] NVARCHAR(50) NOT NULL
);

CREATE TABLE [dbo].[testsuites] (
    [testsuiteid] INT IDENTITY(1,1) PRIMARY KEY,
    [name] NVARCHAR(MAX),
    [description] NVARCHAR(MAX),
    [statusid] INT FOREIGN KEY REFERENCES [dbo].[TestSuiteStatus]([statusid]),
    [releaseid] INT FOREIGN KEY REFERENCES [dbo].[ReleaseMaster]([releaseid])
);

CREATE TABLE [dbo].[testcases] (
    [testcaseid] INT IDENTITY(1,1) PRIMARY KEY,
    [name] NVARCHAR(MAX),
    [description] NVARCHAR(MAX),
    [versionid] NVARCHAR(MAX),
    [prerequisite] NVARCHAR(MAX),
    [statusid] INT FOREIGN KEY REFERENCES [dbo].[TestCaseStatus]([statusid]),
    [author] INT FOREIGN KEY REFERENCES [dbo].[UserProfile]([UserId]),
    [tag] NVARCHAR(MAX)
);

CREATE TABLE [dbo].[testcasesuite] (
    [id] INT IDENTITY(1,1) PRIMARY KEY,
    [testcaseid] INT FOREIGN KEY REFERENCES [dbo].[testcases]([testcaseid]),
    [testsuiteid] INT FOREIGN KEY REFERENCES [dbo].[testsuites]([testsuiteid])
);

CREATE TABLE [dbo].[testrun] (
    [testrunid] INT IDENTITY(1,1) PRIMARY KEY,
    [name] NVARCHAR(MAX),
    [runtypeid] INT,
    [startdate] NVARCHAR(MAX),
    [enddate] NVARCHAR(MAX),
    [userid] INT FOREIGN KEY REFERENCES [dbo].[UserProfile]([UserId]),
    [testrunstatusid] INT,
    [testcaseid] INT FOREIGN KEY REFERENCES [dbo].[testcases]([testcaseid]),
    [testsuiteid] INT FOREIGN KEY REFERENCES [dbo].[testsuites]([testsuiteid]) ON DELETE SET NULL,
    [status] NVARCHAR(50) DEFAULT 'New'
);

CREATE TABLE [dbo].[testruncases] (
    [id] INT IDENTITY(1,1) PRIMARY KEY,
    [testrunid] INT FOREIGN KEY REFERENCES [dbo].[testrun]([testrunid]) ON DELETE CASCADE,
    [testcaseid] INT FOREIGN KEY REFERENCES [dbo].[testcases]([testcaseid]) ON DELETE CASCADE,
    [status] NVARCHAR(50) DEFAULT 'New'
);

CREATE TABLE [dbo].[stepstatus] (
    [id] INT PRIMARY KEY,
    [status] NVARCHAR(50) NOT NULL
);

CREATE TABLE [dbo].[teststeps] (
    [stepid] INT IDENTITY(1,1) PRIMARY KEY,
    [stepname] NVARCHAR(MAX),
    [action] NVARCHAR(MAX),
    [verification] NVARCHAR(MAX),
    [testcaseid] INT FOREIGN KEY REFERENCES [dbo].[testcases]([testcaseid]),
    [statusid] INT FOREIGN KEY REFERENCES [dbo].[stepstatus]([id])
);

CREATE TABLE [dbo].[testrunsteps] (
    [id] INT IDENTITY(1,1) PRIMARY KEY,
    [testrunid] INT FOREIGN KEY REFERENCES [dbo].[testrun]([testrunid]) ON DELETE CASCADE,
    [testcaseid] INT FOREIGN KEY REFERENCES [dbo].[testcases]([testcaseid]) ON DELETE CASCADE,
    [stepid] INT FOREIGN KEY REFERENCES [dbo].[teststeps]([stepid]) ON DELETE CASCADE,
    [statusid] INT FOREIGN KEY REFERENCES [dbo].[stepstatus]([id])
);

CREATE TABLE [dbo].[testcaseversions] (
    [id] INT IDENTITY(1,1) PRIMARY KEY,
    [testcaseid] INT NOT NULL FOREIGN KEY REFERENCES [dbo].[testcases]([testcaseid]) ON DELETE CASCADE,
    [name] NVARCHAR(MAX),
    [description] NVARCHAR(MAX),
    [versionid] NVARCHAR(MAX),
    [prerequisite] NVARCHAR(MAX),
    [statusid] INT FOREIGN KEY REFERENCES [dbo].[TestCaseStatus]([statusid]),
    [author] INT FOREIGN KEY REFERENCES [dbo].[UserProfile]([UserId]),
    [createdat] DATETIME DEFAULT GETDATE(),
    [tag] NVARCHAR(MAX)
);

CREATE TABLE [dbo].[releasesuites] (
    [id] INT IDENTITY(1,1) PRIMARY KEY,
    [releaseid] INT FOREIGN KEY REFERENCES [dbo].[ReleaseMaster]([releaseid]),
    [testsuiteid] INT FOREIGN KEY REFERENCES [dbo].[testsuites]([testsuiteid])
);

CREATE TABLE [dbo].[projectreleases] (
    [projectreleaseid] INT IDENTITY(1,1) PRIMARY KEY,
    [releaseid] INT FOREIGN KEY REFERENCES [dbo].[ReleaseMaster]([releaseid]),
    [projectid] INT FOREIGN KEY REFERENCES [dbo].[ProjectMaster]([projectid])
);

CREATE TABLE [dbo].[Services] (
    [_id] NVARCHAR(255) PRIMARY KEY,
    [name] NVARCHAR(MAX),
    [serviceEndpoint] NVARCHAR(MAX),
    [resouceName] NVARCHAR(MAX)
);

CREATE TABLE [dbo].[defectstatus] (
    [defectstatusid] INT PRIMARY KEY,
    [defectstatus] NVARCHAR(50) NOT NULL
);

CREATE TABLE [dbo].[defects] (
    [defectid] INT IDENTITY(1,1) PRIMARY KEY,
    [subject] NVARCHAR(MAX),
    [description] NVARCHAR(MAX),
    [assignedto] INT FOREIGN KEY REFERENCES [dbo].[UserProfile]([UserId]),
    [createdby] INT FOREIGN KEY REFERENCES [dbo].[UserProfile]([UserId]),
    [createddate] NVARCHAR(MAX),
    [defectstatusid] INT FOREIGN KEY REFERENCES [dbo].[defectstatus]([defectstatusid]),
    [closedby] INT FOREIGN KEY REFERENCES [dbo].[UserProfile]([UserId]),
    [releaseid] INT FOREIGN KEY REFERENCES [dbo].[ReleaseMaster]([releaseid])
);

CREATE TABLE [dbo].[defecttestcase] (
    [id] INT IDENTITY(1,1) PRIMARY KEY,
    [defectid] INT FOREIGN KEY REFERENCES [dbo].[defects]([defectid]) ON DELETE CASCADE,
    [testsuiteid] INT FOREIGN KEY REFERENCES [dbo].[testsuites]([testsuiteid]),
    [testcaseid] INT FOREIGN KEY REFERENCES [dbo].[testcases]([testcaseid])
);


CREATE TABLE [dbo].[Clients] (
    [ClientId] INT IDENTITY(1,1) PRIMARY KEY,
    [ClientName] NVARCHAR(MAX),
    [SecretKey] NVARCHAR(MAX),
    [token] NVARCHAR(MAX),
    [password] NVARCHAR(MAX)
);

CREATE TABLE [dbo].[UserProject] (
    [id] INT IDENTITY(1,1) PRIMARY KEY,
    [userid] INT FOREIGN KEY REFERENCES [dbo].[UserProfile]([UserId]),
    [projectid] INT FOREIGN KEY REFERENCES [dbo].[ProjectMaster]([projectid])
);
