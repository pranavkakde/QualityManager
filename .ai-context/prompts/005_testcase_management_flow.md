# PDD Feature Spec: Test Case Management Flow

## 1. Feature Description
Allows QA engineers to view all test cases grouped within a specific test suite, read their detail parameters (Prerequisites, Author, Version), and create new test cases directly linked to that suite.

---

## 2. Reference Table: TestCaseStatus

### SQL Server DDL (`db/schema.sql` addition)
```sql
CREATE TABLE [dbo].[TestCaseStatus] (
    [statusid] INT PRIMARY KEY,
    [statusname] NVARCHAR(50) NOT NULL
);
```

### Reference Values (`db/mock_data.sql` seed)
* `1` -> `New`
* `2` -> `In Progress`
* `3` -> `Passed`
* `4` -> `Failed`
* `5` -> `Blocked`
* `6` -> `On Hold`

### Foreign Key Constraint
```sql
ALTER TABLE [dbo].[testcases]
ADD FOREIGN KEY ([statusid]) REFERENCES [dbo].[TestCaseStatus]([statusid]);
```

---

## 3. Backend REST Orchestration

### A. Filter Multiple Test Cases
* **Service:** `TestManagementServices` (Port `7784`)
* **Endpoint:** `POST /filter`
* **Request Payload:** `{ "testcases": [1, 2, 3] }`
* **Response:** Array of test case objects.

### B. List Test Cases in a Test Suite
* **Service:** `TestSuiteManagementServices` (Port `7780`)
* **Endpoint:** `GET /testsuite/:testsuiteid/testcases`
* **Orchestration Workflow:**
  1. Fetch all `testcaseid` mappings from `testcasesuite` table where `testsuiteid = :testsuiteid`.
  2. If empty, return `[]`.
  3. Otherwise, forward request to `TestManagementServices` at `POST /filter` with the array of IDs.
  4. Return the fully-populated test case array.

### C. Create Test Case & Map to Suite
* **Service:** `TestManagementServices` (Port `7784`)
* **Endpoint:** `POST /`
* **Payload:** `{ name, description, versionid, prerequisite, statusid, author }`
* **Associative Mapping:**
  * Once the test case is created, call `POST /api/testsuite/:testsuiteid/testcases/:testcaseid` on Port `7780` to insert the row mapping.

---

## 4. Frontend UI Specifications

### A. Test Cases List Screen (`src/pages/TestCaseList.jsx`)
* **Route Path:** `/suites/:testsuiteid/cases`
* **UI Controls:**
  * **Header:** Displays Test Suite Name and Description.
  * **Add Case Button:** Triggers routing to `/suites/:testsuiteid/cases/add`.
  * **Back Button:** Navigates back to `/suites`.
  * **Table Layout:** Shows individual test cases in a responsive, premium tabular view. The table includes columns for:
    * **Name** (bold title text)
    * **Description** (details snippet)
    * **Prerequisites** (prerequisite state)
    * **Version** (indigo tag styled badge)
    * **Status** (pills matching TestCaseStatus: `Passed` = Green, `Failed` = Red, `New` = Slate)
    * **Author** (resolved from User Services gateway `/api/user/users` to display the actual username instead of a numeric ID).

### B. Create Test Case Screen (`src/pages/AddTestCase.jsx`)
* **Route Path:** `/suites/:testsuiteid/cases/add`
* **UI Input Fields:**
  * `name` (required, text)
  * `description` (textarea)
  * `prerequisite` (textarea)
  * `versionid` (text, default `'v1'`)
  * `statusid` (select dropdown, preloaded with TestCaseStatus options)
* **Actions:**
  * **Cancel Button:** Returns to `/suites/:testsuiteid/cases`.
  * **Create Case Button:** Submits details, makes a POST request to `/api/testcase` followed by the suite association POST call, and returns on success.
