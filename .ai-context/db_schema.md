# QualityManager — Database Schema Snapshot

This document provides a precise reference snapshot of the SQL Server database schema. Refer to this schema when prompting the AI to query, insert, or map database fields.

---

## 1. User & Profiles Table

### `UserGroup`
* `GroupId` - `INT IDENTITY(1,1) PRIMARY KEY`
* `GroupName` - `NVARCHAR(MAX)`
* `IsAdmin` - `BIT`

### `UserProfile`
* `UserId` - `INT IDENTITY(1,1) PRIMARY KEY`
* `UserName` - `NVARCHAR(MAX)`
* `Password` - `NVARCHAR(MAX)`
* `GroupId` - `INT FOREIGN KEY REFERENCES UserGroup(GroupId)`

---

## 2. Organization Tables

### `ProjectMaster`
* `projectid` - `INT IDENTITY(1,1) PRIMARY KEY`
* `name` - `NVARCHAR(MAX)`
* `description` - `NVARCHAR(MAX)`

### `ReleaseMaster`
* `releaseid` - `INT IDENTITY(1,1) PRIMARY KEY`
* `name` - `NVARCHAR(MAX)`
* `description` - `NVARCHAR(MAX)`
* `iscurrentrelease` - `BIT`

### `projectreleases`
* `projectreleaseid` - `INT IDENTITY(1,1) PRIMARY KEY`
* `releaseid` - `INT FOREIGN KEY REFERENCES ReleaseMaster(releaseid)`
* `projectid` - `INT FOREIGN KEY REFERENCES ProjectMaster(projectid)`

### `UserProject`
* `id` - `INT IDENTITY(1,1) PRIMARY KEY`
* `userid` - `INT FOREIGN KEY REFERENCES UserProfile(UserId)`
* `projectid` - `INT FOREIGN KEY REFERENCES ProjectMaster(projectid)`

---

## 3. Test & Execution Tables

### `testsuites`
* `testsuiteid` - `INT IDENTITY(1,1) PRIMARY KEY`
* `name` - `NVARCHAR(MAX)`
* `description` - `NVARCHAR(MAX)`
* `statusid` - `INT`
* `releaseid` - `INT FOREIGN KEY REFERENCES ReleaseMaster(releaseid)`

### `releasesuites`
* `id` - `INT IDENTITY(1,1) PRIMARY KEY`
* `releaseid` - `INT FOREIGN KEY REFERENCES ReleaseMaster(releaseid)`
* `testsuiteid` - `INT FOREIGN KEY REFERENCES testsuites(testsuiteid)`

### `testcases`
* `testcaseid` - `INT IDENTITY(1,1) PRIMARY KEY`
* `name` - `NVARCHAR(MAX)`
* `description` - `NVARCHAR(MAX)`
* `versionid` - `NVARCHAR(MAX)`
* `prerequisite` - `NVARCHAR(MAX)`
* `statusid` - `INT`
* `author` - `INT FOREIGN KEY REFERENCES UserProfile(UserId)`

### `testcasesuite`
* `id` - `INT IDENTITY(1,1) PRIMARY KEY`
* `testcaseid` - `INT FOREIGN KEY REFERENCES testcases(testcaseid)`
* `testsuiteid` - `INT FOREIGN KEY REFERENCES testsuites(testsuiteid)`

### `teststeps`
* `stepid` - `INT IDENTITY(1,1) PRIMARY KEY`
* `stepname` - `NVARCHAR(MAX)`
* `action` - `NVARCHAR(MAX)`
* `verification` - `NVARCHAR(MAX)`
* `testcaseid` - `INT FOREIGN KEY REFERENCES testcases(testcaseid)`
* `statusid` - `INT`

### `testrun`
* `testrunid` - `INT IDENTITY(1,1) PRIMARY KEY`
* `name` - `NVARCHAR(MAX)`
* `runtypeid` - `INT`
* `startdate` - `NVARCHAR(MAX)`
* `enddate` - `NVARCHAR(MAX)`
* `userid` - `INT FOREIGN KEY REFERENCES UserProfile(UserId)`
* `testrunstatusid` - `INT`
* `testcaseid` - `INT FOREIGN KEY REFERENCES testcases(testcaseid)`

---

## 4. Defect & System Tables

### `defectstatus`
* `defectstatusid` - `INT PRIMARY KEY`
* `defectstatus` - `NVARCHAR(50) NOT NULL`

### `defects`
* `defectid` - `INT IDENTITY(1,1) PRIMARY KEY`
* `subject` - `NVARCHAR(MAX)`
* `description` - `NVARCHAR(MAX)`
* `assignedto` - `INT FOREIGN KEY REFERENCES UserProfile(UserId)`
* `createdby` - `INT FOREIGN KEY REFERENCES UserProfile(UserId)`
* `createddate` - `NVARCHAR(MAX)`
* `defectstatusid` - `INT FOREIGN KEY REFERENCES defectstatus(defectstatusid)`
* `closedby` - `INT FOREIGN KEY REFERENCES UserProfile(UserId)`
* `releaseid` - `INT FOREIGN KEY REFERENCES ReleaseMaster(releaseid)`

### `defecttestcase`
* `id` - `INT IDENTITY(1,1) PRIMARY KEY`
* `defectid` - `INT FOREIGN KEY REFERENCES defects(defectid) ON DELETE CASCADE`
* `testsuiteid` - `INT FOREIGN KEY REFERENCES testsuites(testsuiteid)`
* `testcaseid` - `INT FOREIGN KEY REFERENCES testcases(testcaseid)`

### `Clients`
* `ClientId` - `INT IDENTITY(1,1) PRIMARY KEY`
* `ClientName` - `NVARCHAR(MAX)`
* `SecretKey` - `NVARCHAR(MAX)`
* `token` - `NVARCHAR(MAX)`
* `password` - `NVARCHAR(MAX)`
