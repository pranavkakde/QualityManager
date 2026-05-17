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
* **Visuals:** A table with list of items representing executable suites (e.g. Authentication Suite, Checkout Suite) with descriptions and an "Add Suite" and "Delete" button to the next of each suite.
* **Interactivity:** Clicking "View Cases" triggers listings of definitions mapped within that suite context.

### Defect Management (`src/pages/DefectList.jsx`)
* **Visuals:** Two-column split layout:
  * **Left Column:** A list of reported defects displaying severity indicators, closed statuses, and titles.
  * **Right Column:** A sleek form to report a bug containing "Subject" and "Description" fields.
* **Interactivity:** Logging a defect triggers a `POST` request to Defect Services and immediately updates the active defect list on success with zero UI lag.
