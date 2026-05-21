# PDD Feature Spec: Test Steps, TestCase Editing, and Versioning

## 1. Feature Description
Adds comprehensive support for sequential test steps inside test cases, automatic version history archiving for test cases upon edit, interactive filtering across the global test case suite, and premium glassmorphic UI action flows.

---

## 2. Reference Table: stepstatus

### SQL Server DDL (`db/schema.sql` addition)
```sql
CREATE TABLE [dbo].[stepstatus] (
    [id] INT PRIMARY KEY,
    [status] NVARCHAR(50) NOT NULL
);
```

### Reference Values (`db/mock_data.sql` seed)
* `1` -> `New`
* `2` -> `Pass`
* `3` -> `Failed`
* `4` -> `Blocked`
* `5` -> `Complete`
* `6` -> `On Hold`

### Foreign Key Constraint
```sql
ALTER TABLE [dbo].[teststeps]
ADD CONSTRAINT FK_teststeps_stepstatus 
FOREIGN KEY (statusid) REFERENCES [dbo].[stepstatus](id);
```

---

## 3. Reference Table: testcaseversions

### SQL Server DDL
```sql
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
```

---

## 4. Backend REST Orchestration

### A. Test Steps CRUD Endpoints
* **Service:** `TestManagementServices` (Port `7784`)
* **Endpoints:**
  * `GET /testcasesteps/:testcaseid/steps` - Retrieve all steps for a testcase.
  * `POST /testcasesteps/:testcaseid/steps` - Add a step. Payload: `{ stepname, action, verification, statusid }`
  * `PUT /testcasesteps/:testcaseid/steps/:stepid` - Edit a step. Payload: `{ stepname, action, verification, statusid }`
  * `DELETE /testcasesteps/:testcaseid/steps/:stepid` - Delete a step.

### B. TestCase Versioning & Cascade Deletes
* **Service:** `TestManagementServices` (Port `7784`)
* **Endpoints:**
  * `GET /:testcaseid/versions` - Retrieve version history.
  * `PUT /:testcaseid` - Update test case. Automatically increments version identifier (e.g. `v1` -> `v2` or `1` -> `2`) and archives a snapshot record to `testcaseversions`.
  * `DELETE /:testcaseid` - Cleanly cascade-deletes all step references, version archives, suite mappings, runs, and defect links before deleting the primary testcase record.

---

## 5. Frontend UI Specifications

### A. Global Test Cases Explorer (`src/pages/TestCaseListGlobal.jsx`)
* **Route Path:** `/cases`
* **Features:**
  * Test Suite dropdown filter selector.
  * Real-time search filters for: Name, Description, Version, Status, and Author.
  * Dynamic, responsive tabular grid showing premium interactive icons for steps, version history, editing, and deletion.

### B. Edit Test Case screen (`src/pages/EditTestCase.jsx`)
* **Route Path:** `/testcases/:testcaseid/edit`
* **Features:**
  * Dynamic preview of the next version string (increments `v1` -> `v2` automatically).
  * Validates inputs, saves updates, and redirects back to parent list.

### C. Version History Explorer (`src/pages/TestCaseVersions.jsx`)
* **Route Path:** `/testcases/:testcaseid/versions`
* **Features:**
  * Displays a premium vertical, interactive step timeline showing exactly when each version was archived, who modified it, and the snapshot parameter states.

### D. Step Management Workspace (`src/pages/TestStepList.jsx`)
* **Route Path:** `/testcases/:testcaseid/steps`
* **Features:**
  * Standardized tabular listing of sequential test steps.
  * Interactive inline modal panels to Add, Edit, or Delete steps.
  * Fully resolves and links status selections to standard `stepstatus` reference keys.
