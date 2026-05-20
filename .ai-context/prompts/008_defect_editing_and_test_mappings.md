# PDD Feature Spec: Defect Editing & Many-to-Many Test Mappings

## 1. Feature Description
Provide users with the ability to edit existing defects in the defect tracker. The edit screen/modal allows changing the defect status. In addition, both the defect creation and editing screens will support assigning/mapping the defect to one or more existing Test Suites and Test Cases, maintaining a many-to-many relationship via a dedicated mapping table `dbo.defecttestcase`.

---

## 2. Technical Contracts & Mappings

### Backend REST Contracts

* **Create Defect:** `POST /api/defect/defect` (Port `7779`)
  * Request payload creates the base defect. It can optionally include an array of initial test mappings:
    ```json
    {
      "subject": "Bug subject",
      "description": "Bug description",
      "assignedto": 2,
      "createdby": 1,
      "createddate": "2026-05-20T15:45:15.000Z",
      "defectstatusid": 1,
      "closedby": null,
      "releaseid": 1,
      "testcases": [
        { "testsuiteid": 3, "testcaseid": 14 }
      ]
    }
    ```

* **Update Defect:** `PUT /api/defect/defect/:defectid` (Port `7779`)
  * Request payload updates the base defect. It can optionally include the full set of active test mappings to reconcile:
    ```json
    {
      "subject": "Bug subject",
      "description": "Bug description",
      "assignedto": 2,
      "createdby": 1,
      "createddate": "2026-05-20T15:45:15.000Z",
      "defectstatusid": 2,
      "closedby": null,
      "releaseid": 1,
      "testcases": [
        { "testsuiteid": 3, "testcaseid": 14 },
        { "testsuiteid": 3, "testcaseid": 15 }
      ]
    }
    ```

* **Fetch Defect Mapped Test Cases:** `GET /api/defect/defect/:defectid/testcases` (Port `7779`)
  * Returns the list of test cases mapped to the specified defect, including their test suite information:
    ```json
    [
      {
        "id": 1,
        "defectid": 5,
        "testsuiteid": 3,
        "testcaseid": 14
      }
    ]
    ```

### DB Schema References
* **Table `dbo.defecttestcase` [NEW]:**
  * `id` - `INT IDENTITY(1,1) PRIMARY KEY`
  * `defectid` - `INT FOREIGN KEY REFERENCES dbo.defects(defectid) ON DELETE CASCADE`
  * `testsuiteid` - `INT FOREIGN KEY REFERENCES dbo.testsuites(testsuiteid)`
  * `testcaseid` - `INT FOREIGN KEY REFERENCES dbo.testcases(testcaseid)`

---

## 3. Frontend UI Specifications

### Defect List View (`src/pages/DefectList.jsx`)
* **Edit Button**:
  - Add an Edit button (Pencil icon from `lucide-react`) next to each defect's action buttons (View details / Delete).
* **Edit Modal**:
  - Displays a modal/form pre-filled with the selected defect's fields.
  - Includes a **Defect Status** dropdown populated from the statuses reference list.
  - Includes a **Linked Test Cases** section showing a list/table of currently linked test cases with an "Unlink" (Trash icon) button next to each.
  - Includes a **Link a New Test Case** section:
    - **Test Suite** dropdown: Populated with all suites assigned to the active release.
    - **Test Case** dropdown: Populated dynamically with cases belonging to the selected Test Suite.
    - **Link Case** button: Appends the selected suite/case pair to the current list of mapped test cases.
  - Submits updates via `PUT /api/defect/defect/:defectid`.
* **Report Defect Modal**:
  - Include an identical **Linked Test Cases** list and **Link a New Test Case** section to allow mapping multiple test suites and test cases on creation.
* **Details Modal**:
  - Display the list of all mapped Test Cases (and their associated Test Suite names) under a dedicated section.

---

## 4. Advanced Filtering and Reports

### Backend REST Contracts
* **Fetch All Defect-Testcase Mappings:** `GET /api/defect/defect-testcases/all` (Port `7779`)
  * Returns all defect-testcase mappings across all releases. This enables efficient bulk resolution and avoids $N$ queries for $N$ defects:
    ```json
    [
      {
        "id": 1,
        "defectid": 5,
        "testsuiteid": 3,
        "testcaseid": 14
      }
    ]
    ```

### Frontend UI Filters Panel
* **Advanced Filters Dashboard Card:**
  * Rendered as a glassmorphic block below the release summary metrics.
  * Fields included:
    * **Test Suite**: Dropdown populated with all suites assigned to the active release. Selecting a suite dynamically filters the options available in the Test Case dropdown.
    * **Test Case**: Cascading dropdown populated dynamically with cases belonging to the selected Test Suite.
    * **Assigned To**: Dropdown populated with all active developers in the system.
    * **Status**: Dropdown populated from the reference table of defect statuses (e.g., 'New', 'In Progress', 'Fixed', etc.).
    * **Search Bar**: Free text search filtering by defect Subject and Description.
  * **Clear Filters**: A quick reset button to clear all filter criteria in one click.
  * **Interactive State**: List of defects updates dynamically and immediately in response to any filter changes (client-side matching). A dedicated "No Matching Defects" state with a clear button is displayed when filters result in an empty list.

### Excel / Spreadsheet Export
* **Export Button**:
  * Rendered as an emerald Excel-themed action button positioned alongside the "Report Defect" button.
  * **Export Action**:
    * Generates a dynamic CSV file containing the currently filtered defects list.
    * Columns exported: Defect ID, Subject, Description, Assigned To developer, Created By user, Created Date, Status, Release ID, Linked Test Suites, and Linked Test Cases.
    * Uses a zero-dependency client-side Blob generation with a UTF-8 Byte Order Mark (`\uFEFF`) pre-pended, forcing Microsoft Excel and other spreadsheet viewers to automatically parse, decode, and render all characters correctly.
