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

### `TestCaseStatus`
* `statusid` - `INT PRIMARY KEY`
* `statusname` - `NVARCHAR(50)`
* Standard values: `1: New`, `2: In Progress`, `3: Passed`, `4: Failed`, `5: Blocked`, `6: On Hold`, `7: In Review`, `8: Reviewed`

### `testcases`
* `testcaseid` - `INT IDENTITY(1,1) PRIMARY KEY`
* `name` - `NVARCHAR(MAX)`
* `description` - `NVARCHAR(MAX)`
* `versionid` - `NVARCHAR(MAX)`
* `prerequisite` - `NVARCHAR(MAX)`
* `tag` - `NVARCHAR(MAX) NULL`
* `statusid` - `INT FOREIGN KEY REFERENCES TestCaseStatus(statusid)`
* `author` - `INT FOREIGN KEY REFERENCES UserProfile(UserId)`

### `testcasesuite`
* `id` - `INT IDENTITY(1,1) PRIMARY KEY`
* `testcaseid` - `INT FOREIGN KEY REFERENCES testcases(testcaseid)`
* `testsuiteid` - `INT FOREIGN KEY REFERENCES testsuites(testsuiteid)`

### `stepstatus`
* `id` - `INT PRIMARY KEY`
* `status` - `NVARCHAR(50) NOT NULL`
* Standard values: `1: New`, `2: Pass`, `3: Failed`, `4: Blocked`, `5: Complete`, `6: On Hold`

### `teststeps`
* `stepid` - `INT IDENTITY(1,1) PRIMARY KEY`
* `stepname` - `NVARCHAR(MAX)`
* `action` - `NVARCHAR(MAX)`
* `verification` - `NVARCHAR(MAX)`
* `testcaseid` - `INT FOREIGN KEY REFERENCES testcases(testcaseid) ON DELETE CASCADE`
* `statusid` - `INT FOREIGN KEY REFERENCES stepstatus(id)`

### `testcaseversions`
* `id` - `INT IDENTITY(1,1) PRIMARY KEY`
* `testcaseid` - `INT FOREIGN KEY REFERENCES testcases(testcaseid) ON DELETE CASCADE`
* `name` - `NVARCHAR(MAX)`
* `description` - `NVARCHAR(MAX)`
* `versionid` - `NVARCHAR(MAX)`
* `prerequisite` - `NVARCHAR(MAX)`
* `tag` - `NVARCHAR(MAX) NULL`
* `statusid` - `INT FOREIGN KEY REFERENCES TestCaseStatus(statusid)`
* `author` - `INT FOREIGN KEY REFERENCES UserProfile(UserId)`
* `createdat` - `DATETIME DEFAULT GETDATE()`

### `testrun`
* `testrunid` - `INT IDENTITY(1,1) PRIMARY KEY`
* `name` - `NVARCHAR(MAX)`
* `runtypeid` - `INT`
* `startdate` - `NVARCHAR(MAX)`
* `enddate` - `NVARCHAR(MAX)`
* `userid` - `INT FOREIGN KEY REFERENCES UserProfile(UserId)`
* `testrunstatusid` - `INT`
* `testcaseid` - `INT FOREIGN KEY REFERENCES testcases(testcaseid)`
* `testsuiteid` - `INT FOREIGN KEY REFERENCES testsuites(testsuiteid) ON DELETE SET NULL`
* `status` - `NVARCHAR(50) DEFAULT 'New'`

### `testruncases`
* `id` - `INT IDENTITY(1,1) PRIMARY KEY`
* `testrunid` - `INT FOREIGN KEY REFERENCES testrun(testrunid) ON DELETE CASCADE`
* `testcaseid` - `INT FOREIGN KEY REFERENCES testcases(testcaseid) ON DELETE CASCADE`
* `status` - `NVARCHAR(50) DEFAULT 'New'`

### `testrunsteps`
* `id` - `INT IDENTITY(1,1) PRIMARY KEY`
* `testrunid` - `INT FOREIGN KEY REFERENCES testrun(testrunid) ON DELETE CASCADE`
* `testcaseid` - `INT FOREIGN KEY REFERENCES testcases(testcaseid) ON DELETE CASCADE`
* `stepid` - `INT FOREIGN KEY REFERENCES teststeps(stepid) ON DELETE CASCADE`
* `statusid` - `INT FOREIGN KEY REFERENCES stepstatus(id)`

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
