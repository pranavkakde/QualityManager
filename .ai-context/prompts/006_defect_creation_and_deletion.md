# PDD Feature Spec: Defect Creation & Deletion

## 1. Feature Description
Provide a fully-featured, premium Bug Tracker screen that allows users to view defects associated with the selected release, report a new defect with dedicated fields, assign it to a developer, and delete existing defects with full confirmation.

---

## 2. Technical Contracts & Mappings

### Backend REST Contracts
* **Fetch Defects by Release:** `GET /api/defect/defects?releaseid={releaseid}` (Port `7779`)
  * Returns an array of defects filtered by the selected release: `[ { "defectid": 1, "subject": "UI issue", "description": "...", "assignedto": 3, "createdby": 2, "createddate": "2026-05-01T10:00:00Z", "defectstatusid": 1, "releaseid": 1 } ]`
* **Create Defect:** `POST /api/defect/defect` (Port `7779`)
  * Request payload:
    ```json
    {
      "subject": "String",
      "description": "String",
      "assignedto": Integer,
      "createdby": Integer,
      "createddate": "String (ISO Date)",
      "defectstatusid": 1,
      "closedby": null,
      "releaseid": Integer
    }
    ```
* **Delete Defect:** `DELETE /api/defect/defect/{defectid}` (Port `7779`)
  * Deletes a defect from the database.
* **Fetch User Directory:** `GET /api/user/users` (Port `7777`)
  * Used to resolve user IDs and populate the "Assigned To" dropdown list.

---

## 3. Frontend UI Specifications

### Defect List & Management (`src/pages/DefectList.jsx`)
* **Grid/Table Layout:**
  * Displays Defect ID, Subject, Assigned To user, Status with status pills (e.g. Red for New, Yellow for In Progress, Green for Closed), and action buttons.
  * **Delete Button:** Red trash icon or button next to each defect. Clicking triggers a confirmation prompt and then calls `DELETE /api/defect/defect/{defectid}`.
  * **Report Defect Button:** Indigo-styled primary button that opens a beautiful modal/drawer to report a new defect.

### Report Defect Form
* **Fields:**
  * **Subject:** Text input.
  * **Description:** Rich textarea.
  * **Assigned To:** Dropdown list dynamically populated from `/api/user/users` displaying user names.
* **Auto-populated Fields (Invisible/Read-only):**
  * **Created By:** Automatically matched from the logged-in user's username and resolved to their numeric `UserId` via user directory.
  * **Created Date:** Automatically sets current local timestamp.
  * **Status:** Defaulted to `1` (New).
  * **Release ID:** Passed dynamically from the selected active release.
