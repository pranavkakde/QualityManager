# PDD Feature Spec: Project & Release Dashboard

## 1. Feature Description
Provide a centralized overview dashboard. The interface allows selecting a Project and its mapped Release from dynamic header dropdowns, instantly refreshing statistics cards (Total Suites, Active Defects, and Pass Rate) and rendering a list of recently executed test cases.

---

## 2. Technical Contracts & Mappings

### Backend REST Contracts
* **Fetch Projects:** `GET /api/project/projects` (Port `7782`)
  * Returns an array of projects: `[ { "projectid": 1, "name": "Alpha Project" } ]`.
* **Fetch Mapped Releases:** `GET /api/project/project/:projectid/releases` (Port `7782`)
  * Returns releases mapped to a project: `[ { "releaseid": 10, "name": "v1.0" } ]`.
* **Fetch Release Stats:** `GET /api/testcase/release/:releaseid/testcases` (Port `7784`)
  * Returns test case execution logs.

---

## 3. Frontend UI Specifications

### Header Controls (`src/components/Header.jsx`)
* **Visuals:** Top horizontal header bar with clean border lines, a user avatar drop-menu displaying active username initials, and a Logout option.
* **Interactivity:** Two inline HSL-colored selectors containing Projects and Releases. Selecting a project immediately triggers a callback to populate releases mapped to that specific project ID, preventing empty states.

### Dashboard Metrics (`src/pages/Dashboard.jsx` & `src/components/DashboardCard.jsx`)
* **Visuals:** Three-column grid displaying high-contrast metric cards containing colored Lucide vector icons:
  * **Total Test Suites:** Renders the count of active test suites.
  * **Active Defects:** Renders the count of open bugs.
  * **Pass Rate:** Computes and prints the percentage of successful test runs.
* **Recent Cases List:** Renders an elegant table listing recent test cases and their execution statuses (Passed, Failed, Running).
