-- SQL Server Schema generated from QualityManager cachejsorm model files

CREATE TABLE [dbo].[UserProfile] (
    [UserId] INT PRIMARY KEY,
    [UserName] NVARCHAR(MAX),
    [Password] NVARCHAR(MAX),
    [GroupId] INT
);

CREATE TABLE [dbo].[UserGroup] (
    [GroupId] INT PRIMARY KEY,
    [GroupName] NVARCHAR(MAX),
    [IsAdmin] BIT
);

CREATE TABLE [dbo].[testcasesuite] (
    [id] INT PRIMARY KEY,
    [testcaseid] INT,
    [testsuiteid] INT
);

CREATE TABLE [dbo].[testsuites] (
    [testsuiteid] INT PRIMARY KEY,
    [name] NVARCHAR(MAX),
    [description] NVARCHAR(MAX),
    [statusid] INT,
    [releaseid] INT
);

CREATE TABLE [dbo].[testrun] (
    [testrunid] INT PRIMARY KEY,
    [name] NVARCHAR(MAX),
    [runtypeid] INT,
    [startdate] NVARCHAR(MAX),
    [enddate] NVARCHAR(MAX),
    [userid] INT,
    [testrunstatusid] INT,
    [testcaseid] INT
);

CREATE TABLE [dbo].[testcases] (
    [testcaseid] INT PRIMARY KEY,
    [name] NVARCHAR(MAX),
    [description] NVARCHAR(MAX),
    [versionid] NVARCHAR(MAX),
    [prerequisite] NVARCHAR(MAX),
    [statusid] INT,
    [author] INT
);

CREATE TABLE [dbo].[teststeps] (
    [stepid] INT PRIMARY KEY,
    [stepname] NVARCHAR(MAX),
    [action] NVARCHAR(MAX),
    [verification] NVARCHAR(MAX),
    [testcaseid] INT,
    [statusid] INT
);

CREATE TABLE [dbo].[releasesuites] (
    [id] INT PRIMARY KEY,
    [releaseid] INT,
    [testsuiteid] INT
);

CREATE TABLE [dbo].[ReleaseMaster] (
    [releaseid] INT PRIMARY KEY,
    [name] NVARCHAR(MAX),
    [description] NVARCHAR(MAX),
    [iscurrentrelease] BIT
);

CREATE TABLE [dbo].[projectreleases] (
    [projectreleaseid] INT PRIMARY KEY,
    [releaseid] INT,
    [projectid] INT
);

CREATE TABLE [dbo].[ProjectMaster] (
    [projectid] INT PRIMARY KEY,
    [name] NVARCHAR(MAX),
    [description] NVARCHAR(MAX)
);

CREATE TABLE [dbo].[Services] (
    [_id] NVARCHAR(255) PRIMARY KEY,
    [name] NVARCHAR(MAX),
    [serviceEndpoint] NVARCHAR(MAX),
    [resouceName] NVARCHAR(MAX)
);

CREATE TABLE [dbo].[defects] (
    [defectid] INT PRIMARY KEY,
    [subject] NVARCHAR(MAX),
    [description] NVARCHAR(MAX),
    [assignedto] INT,
    [createdby] INT,
    [createddate] NVARCHAR(MAX),
    [defectstatusid] INT,
    [closedby] INT
);

CREATE TABLE [dbo].[Clients] (
    [ClientId] INT PRIMARY KEY,
    [ClientName] NVARCHAR(MAX),
    [SecretKey] NVARCHAR(MAX),
    [token] NVARCHAR(MAX),
    [password] NVARCHAR(MAX)
);
