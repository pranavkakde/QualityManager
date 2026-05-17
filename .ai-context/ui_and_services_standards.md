# UI & Services Architectural Standards

This document contains structural standards for both the React client UI and the Node.js Express backend microservices. Refer to this handbook when generating components or endpoints.

---

## 1. Frontend Client Standards (`TestManagementUI`)

* **Technology:** React 19, Vite v6, Tailwind CSS v4, Lucide React, Axios.
* **Component Architecture:**
  * **Presentational Components (`src/components/`):** Purely layout and design elements (e.g. `Sidebar.jsx`, `Header.jsx`, `DashboardCard.jsx`).
  * **Views & Pages (`src/pages/`):** Higher-level route panels containing business logic and REST fetches (e.g. `Dashboard.jsx`, `TestSuiteList.jsx`, `DefectList.jsx`, `UserManagement.jsx`, `LogViewer.jsx`, `Login.jsx`).
* **Path Integrity:** Always use relative paths for module resolution (e.g., `import Sidebar from '../components/Sidebar'`). NEVER hardcode absolute paths or absolute domain URLs.
* **Behavior Testing:** Component and integration test specs are isolated inside the `src/__tests__/` directory. Write specs using **Vitest** and **React Testing Library**, mocking Axios network calls and checking visual elements by accessibility roles.
* **Data Defense:** Always add robust `Array.isArray()` checks to lists fetched from mock or evolving endpoints before invoking loops, preventing React rendering crashes.

---

## 2. Backend Services Standards (`packages/Services`)

* **Technology:** Node.js, Express, Sequelize, MSSQL Server.
* **Database ORM Constraints (`shared/orm.js`):**
  * Database access is wrapped inside the custom `TableMapper` Sequelize helper.
  * **NO Aggregations / NO Joins:** The `TableMapper` models do not implement `.aggregate()` or `.join()`. Direct invocations will fail synchronously. Only invoke standard sequelize wrappers: `.find()`, `.insert()`, `.update()`, and `.delete()`.
* **Inter-Service Authorization Forwarding:**
  * Backend microservices make REST calls to each other across the Docker internal bridge network.
  * Outgoing superagent/axios requests made within Express route handlers **must** set the incoming authorization token to pass the API Gateway authentication checks:
    ```javascript
    superagent
      .get(URL)
      .set('Authorization', req.headers.authorization)
      .then(res => ...)
    ```
* **Express Handler Signatures:**
  * Always implement robust Express router callback structures with `next` and proper try/catch blocks:
    ```javascript
    router.get('/route', async (req, res, next) => {
      try {
        const data = await Model.find(...);
        res.json(data);
      } catch (err) {
        next(err);
      }
    });
    ```
