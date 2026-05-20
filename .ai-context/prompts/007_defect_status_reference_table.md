# PDD Feature Spec: Defect Status Dropdown & Reference Table

## 1. Feature Description
Enhance the Bug Tracker screen by replacing the static hardcoded defect statuses with dynamic status definitions fetched from the database `dbo.defectstatus` table. Include a Status dropdown in the "Report New Defect" modal to allow users to set any available status when creating a bug, and style the defect listing using dynamic badges mapped from this reference table.

---

## 2. Technical Contracts & Mappings

### Backend REST Contracts
* **Fetch Defect Statuses:** `GET /api/defect/statuses` (Port `7779`)
  * Returns the full list of defect statuses defined in the reference table:
    ```json
    [
      { "defectstatusid": 1, "defectstatus": "New" },
      { "defectstatusid": 2, "defectstatus": "In Progress" },
      { "defectstatusid": 3, "defectstatus": "Fixed" },
      { "defectstatusid": 4, "defectstatus": "Retest Pass" },
      { "defectstatusid": 5, "defectstatus": "Retest Failed" },
      { "defectstatusid": 6, "defectstatus": "Closed" },
      { "defectstatusid": 7, "defectstatus": "Cancelled" },
      { "defectstatusid": 8, "defectstatus": "Reopened" }
    ]
    ```

### DB Schema References
* **Table `dbo.defectstatus`:**
  * `defectstatusid` - `INT PRIMARY KEY`
  * `defectstatus` - `NVARCHAR(50) NOT NULL`
* **Table `dbo.defects` Update:**
  * `defectstatusid` - `INT FOREIGN KEY REFERENCES dbo.defectstatus(defectstatusid)`

---

## 3. Frontend UI Specifications

### Defect List & Management (`src/pages/DefectList.jsx`)
* **Status Badges & Mapping:**
  * On page load, fetch all statuses from `/api/defect/statuses`.
  * Dynamically map and render the text from the `defectstatus` table based on the defect's `defectstatusid`.
  * Display high-quality HSL-tailored/styled status pills (e.g. Red for New/Retest Failed, Yellow for In Progress, Green for Fixed/Closed/Retest Pass, Gray/Slate for Cancelled, etc.).

### Report Defect Form
* **Fields:**
  * **Defect Status:** A new dropdown field dynamically populated from `/api/defect/statuses` listing all available statuses, defaulting to `1` (New).
  * Selection gets submitted as the numeric `defectstatusid` in the `POST /api/defect/defect` request payload.
