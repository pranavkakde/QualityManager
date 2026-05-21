# PDD Feature Spec: Test Suite & Defect Management

## 1. Feature Description
Provide dedicated interfaces to map and display active Test Suites assigned to a release, and a robust Bug Tracker that lists open defects and hosts a submission form to log new system defects.

---

## 2. Technical Contracts & Mappings

### Backend REST Contracts
* **Fetch Suites:** `GET /release/{releaseid}/testsuite/{testsuiteid}` (Port `7781`)
  * Returns an array of test suite id where releaseid is from the release id selected based on the project.
 Then fetch details of each test suite`GET /api/testsuite/testsuites` (Port `7780`)
  * Returns an array of test suites.
* **Fetch Defects:** `GET /api/defect/defects` (Port `7779`)
  * Returns an array of bugs: `[ { "defectid": 1, "subject": "UI issue", "defectstatusid": 1 } ]`.
* **Create Defect:** `POST /api/defect/defect` (Port `7779`)
  * Request payload: `{ "subject": "...", "description": "...", "releaseid": 10 }`.

---

## 3. Frontend UI Specifications

### Test Suites View (`src/pages/TestSuiteList.jsx`)
* **Visuals:** A stunning, high-fidelity responsive HTML table containing columns: ID, Suite Name, Description, Status, and Actions.
  - **Status Badge**: Displays status dynamically as Created, In Progress, or Completed using premium colored badges.
* **Interactivity & Integrated Actions**:
  - **Test Cases Button**: Icon-only action with a descriptive tooltip/title that navigates the user to the Test Cases screen (`/suites/:testsuiteid/cases`) for that suite.
  - **Defects Button**: Icon-only action with a descriptive tooltip/title that navigates the user to the Defect Tracker screen (`/defects`) and passes state so the defect list is automatically pre-filtered by the selected test suite.
  - **Edit Button**: Opens a gorgeous in-page overlay Modal to edit the suite's Name, Description, and Status. Submitting triggers a `PUT` API request to Test Suite Management Services and updates the table on success.
  - **Delete Button**: Opens a sweet confirmation overlay. Confirming triggers a `DELETE` API request to Test Suite Management Services, removing the suite from the table without full page reloads.

### Defect Management (`src/pages/DefectList.jsx`)
* **Visuals:** Two-column split layout:
  * **Left Column:** A list of reported defects displaying severity indicators, closed statuses, and titles.
  * **Right Column:** A sleek form to report a bug containing "Subject" and "Description" fields.
* **Interactivity:** Logging a defect triggers a `POST` request to Defect Services and immediately updates the active defect list on success with zero UI lag.
