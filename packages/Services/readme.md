# QualityManager — Backend Microservices Reference Manual

This directory contains the backend microservices architecture for the **QualityManager** platform. The services are written in **Node.js** utilizing **Express** as the routing framework and **Sequelize** for Microsoft SQL Server (MSSQL) database mapping.

---

## 1. Microservice Topology

Each microservice runs in its own isolated Node process with standard port mapping:

| Port | Service Package | Purpose |
| :--- | :--- | :--- |
| `7777` | **UserManagementServices** | User creation, validation, session token issuance |
| `7779` | **DefectManagementServices** | Bug logging, severity level associations, case linkages |
| `7780` | **TestSuiteManagementServices** | Test suites groups creation and releases mappings |
| `7781` | **ReleaseManagementServices** | Release timelines, version scopes, test run targets |
| `7782` | **ProjectManagementServices** | Core project workspaces |
| `7784` | **TestCaseManagementServices** | Action steps, execution status logs, runs history |

---

## 2. Database Mapping Layer (Sequelize ORM)

Database queries are mediated through a centralized ORM wrapper located at:
* **[packages/Services/shared/orm.js](file:///c:/Users/Pranav/Documents/Code/git/QualityManager/packages/Services/shared/orm.js)**

This wrapper dynamically maps relational tables into custom Sequelize entities using the `TableMapper` class. 

### Development Guidelines
* **No Raw `.aggregate()` / `.join()` Methods:** The `TableMapper` entity classes support standard `.find()`, `.insert()`, `.update()`, and `.delete()` wrappers. Explicit aggregation/joining queries are unsupported and will reject promises.
* **Foreign Key and ID Constraints:** Tables use standard MSSQL `IDENTITY` columns. Keep in mind that project IDs use `.projectid`, release IDs use `.releaseid`, and user mappings utilize `.UserId` to align with the database seed schema in `mock_data.sql`.

---

## 3. Microservice Route Catalog

The following is the structured catalog of API endpoints exposed by the services:

### 🔑 User & Authentication Services (Port `7777`)
Manages identities, security tokens, and user permissions:

* `GET /api/user/users` - Fetches all users.
* `POST /api/user/user` - Creates a new user.
* `PUT /api/user/user/:userid` - Updates a user's details.
* `DELETE /api/user/user/:userid` - Deletes a user.
* `POST /api/user/login` - Authenticates credentials and returns a secure JWT token.
* `GET /api/user/user/:userid/projects` - Fetches project IDs mapped to the user.
* `POST /api/user/project` - Maps a user to a specific project.
* `DELETE /api/user/user/:userid/project/:projectid` - Removes project mapping from a user.

### 📁 Project Services (Port `7782`)
Manages primary workspace scopes:

* `GET /api/project/projects` - Fetches all active projects.
* `POST /api/project/project` - Creates a new project.
* `GET /api/project/project/:projectid` - Fetches project details.
* `GET /api/project/project/:projectid/releases` - Fetches releases associated with a project.

### 📅 Release Services (Port `7781`)
Manages versions and release stages:

* `GET /api/release/releases` - Fetches all releases.
* `POST /api/release/release` - Creates a new release.
* `GET /api/release/release/:releaseid` - Fetches details of a specific release.
* `GET /api/release/release/:releaseid/testsuites` - Fetches test suites assigned to the release.

### 🧪 Test Case Services (Port `7784`)
Handles test definitions, steps, and run logging:

* `GET /api/testcase/testcases` - Fetches all test cases.
* `POST /api/testcase/testcase` - Creates a new test case.
* `GET /api/testcase/testcases/:testcaseid` - Fetches details of a test case.
* `GET /api/testcase/testcases/:testcaseid/steps` - Fetches definition steps of a case.
* `POST /api/testcase/testcases/:testcaseid/step` - Adds a step to a test case.
* `GET /api/testcase/release/:releaseid/testcases` - Fetches test cases assigned to a release.
* `GET /api/testcase/release/:releaseid/testsuites` - Fetches test suites assigned to a release.
* `GET /api/testcase/release/:releaseid/defects` - Fetches defects reported under a release.
* `GET /api/testcase/testcaseruns/:testcaseid/testruns` - Fetches execution history logs of a case.

### 🧪 Test Suite Services (Port `7780`)
Groups test cases into execution blocks:

* `GET /api/testsuite/testsuites` - Fetches all test suites.
* `POST /api/testsuite/testsuite` - Creates a new test suite.
* `GET /api/testsuite/testsuite/:testsuiteid` - Fetches details of a suite.
* `GET /api/testsuite/testsuite/:testsuiteid/testcases` - Fetches cases mapped to a suite.
* `POST /api/testsuite/testcase` - Mappings a test case to a suite.

### 🐛 Defect Services (Port `7779`)
Tracks issues, failures, and resolution state:

* `GET /api/defect/defects` - Fetches all reported defects.
* `POST /api/defect/defect` - Logs a new defect (linking to test case/step).
* `GET /api/defect/defect/:defectid` - Fetches defect details.
* `PUT /api/defect/defect/:defectid` - Updates a defect status.