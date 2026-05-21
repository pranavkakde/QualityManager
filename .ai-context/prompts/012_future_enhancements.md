# Future Enhancements Roadmap

## Overview
This document specifies the structural standards, architectural guidelines, and functional rules for future developers and AI agents extending QualityManager to enterprise-grade capabilities. Refer to these specifications when implementing integrations, pipeline automations, or RBAC controls.

---

## 1. Automation Pipeline Integration

### Core Specifications
- **Ingestion Endpoint**: A protected REST API (`POST /api/testcase/results/import`) must be exposed in `TestManagementServices`.
- **Token Authorization**: CI/CD ingestion requests must authorize using a dedicated long-lived Pipeline API Token (JWT) mapped to the target project.
- **Payload Format**: The endpoint must accept both standard JUnit XML and Cucumber JSON schemas.

### Architectural Rules
1. **Dynamic Run Provisioning**: If a pipeline execution refers to a non-existent or active test run name, the backend must provision a new `dbo.testrun` dynamically.
2. **Result Mapping**: 
   - Parse execution status from the XML/JSON report.
   - For every executed automation test, search for a matching test case identifier (`dbo.testcase.tag` or `dbo.testcase.name`).
   - If found, create or update the matching `dbo.testruncases` status ( Passed, Failed, Blocked).
   - If not found, log the warning to OpenTelemetry and flag it in a local database `dbo.unmappedautomatedresults` log table.

---

## 2. Bidirectional External Defect Tracking (Jira / GitHub)

### Core Specifications
- **Integration Management**: Extend `DefectManagementServices` to store credential and webhook mapping definitions inside a new table `dbo.integrations`.
- **Integrations Schema (`dbo.integrations`)**:
  - `IntegrationId` (INT, PK, Identity)
  - `ProjectId` (INT, FK to `dbo.project`)
  - `Platform` (VARCHAR, e.g., 'Jira', 'GitHub')
  - `ApiUrl` (VARCHAR)
  - `CredentialsSecret` (VARCHAR, Encrypted API Token)
  - `MappingDetails` (VARCHAR, JSON string representing custom field mappings)

### Architectural Rules
1. **Synchronous Provisioning**: Creating a defect in QualityManager must invoke a background job (or queue) to provision a matching ticket in the target external platform via its REST API.
2. **Idempotent Webhook Synchronization**:
   - Expose a public webhook endpoint: `POST /api/defect/webhook/sync`.
   - Upon receiving status changes from Jira or GitHub (e.g., bug closed), update the corresponding `dbo.defect.status` locally.
   - Ensure signature verification (using shared secrets) is executed on all incoming webhook payloads.

---

## 3. Keycloak-Federated Role-Based Access Control (RBAC)

### Core Specifications
- Centralize authentication and role structures directly within Keycloak realms. 
- Eliminate the use of database-driven local access mapping tables for general platform authorization.

### Architectural Rules
1. **Role Claims Verification**:
   - Shared authentication middleware (`shared/auth.js`) must parse Keycloak’s token access claims:
     ```javascript
     req.user.roles = verified.realm_access.roles || [];
     ```
2. **Access Control Levels**:
   - **`QualityManager-Admin`**: Full read-write permission to all administrative scopes (Users, System Telemetry, Loki Viewer, global Integrations).
   - **`QualityManager-Lead`**: Read-write access to Test Cases, Test Suites, Release Plans, and Project Configurations.
   - **`QualityManager-Tester`**: Read-write access strictly to Defect Creation, Step Executions, and manual Test Runs.
3. **Gateway Enforcement**: 
   - Express router endpoints must restrict access utilizing a standard, reusable role-checking wrapper:
     ```javascript
     const checkRoles = (allowedRoles) => (req, res, next) => {
         const hasRole = req.user.roles.some(role => allowedRoles.includes(role));
         if (!hasRole) return res.status(403).json({ error: "Access Denied: Insufficient Permissions" });
         next();
     };
     ```

---

## 4. Advanced Test Analytics & AI Failure Diagnostics

### Core Specifications
- Provide visual reporting and log diagnostics.

### Architectural Rules
1. **Reporting Aggregations**:
   - Since standard Sequelize wrapper `TableMapper` prevents direct aggregations or SQL joins, all visual reports must be computed asynchronously, utilizing materialized views or scheduled telemetry exports to optimize rendering speeds.
2. **AI Failure Correlator**:
   - Expose an endpoint `POST /api/testcase/diagnose` which accepts a stack trace string from a failed automated execution.
   - The analysis agent must search the local database for historical bugs `dbo.defect` containing similar exception keywords.
   - If a correlation is detected, return a suggested resolution path based on past bug fixes.

---

## 5. Client Offline Support (IndexedDB PWA)

### Core Specifications
- Permit manual test run executions to be completed fully offline in network-restricted labs.

### Architectural Rules
1. **Service Worker Caching**:
   - Cache core application assets (CSS, JS, Static HTML) for immediate offline reload.
2. **Local Data Isolation**:
   - Download the target manual test run and its associated steps to browser IndexedDB when the user chooses "Enable Offline Mode".
3. **Pristine Sync Queue**:
   - Queue offline manual execution records locally in an IndexedDB synchronization queue.
   - Monitor the browser's connectivity status. Once the user is back online, bulk-post changes to `/api/testcase/testruns/sync` using optimistic locking to handle concurrent updates cleanly.
