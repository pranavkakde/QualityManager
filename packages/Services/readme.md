## Services for QualityManager - Open source test management tool
This project contains backend services for QualityManager. 
These services are written in NodeJS, JavaScript and Express. 
Following is a list of backend services. API documentation is deployed using swagger-ui-express which can be access using `/api-docs` path. Each folder consists of a dedicated app running Express server. The build pipeline in Azure Devops builds docker images of these services using Docker compose and pushes them to Docker hub. Once these images built and deployed to Docker Hub, Azure Devops release deploys these images on Kubernates cluster running on VSTS agent. 
### List of Services
1. User Management 
2. Test Case Management
3. Test Suite Management
4. Project
5. Release
6. Administration
7. Defect Management

#### User Management
User management services provide CRUD operation for User management within application
1. GET /users
2. POST /users
3. PUT /users/{userid}
4. DELETE /users/{userid}
5. GET /users/{groupid}
6. POST /users/{groupid}
7. GET  /gettoken (returns a JSON web token which is required for all services)

#### Test Case management
1. GET /testcases
2. GET /testcases/{testcaseid}
3. POST /testcases
4. PUT /testcases/{testcaseid}
5. DELETE /testcases/{testcaseid}
6. GET  /testcases/{testcaseid}/steps
7. GET  /testcases/{testcaseid}/steps/{teststepid}
8. POST  /testcases/{testcaseid}/steps
9. PUT  /testcases/{testcaseid}/steps/{teststepid}
10. DELETE  /testcases/{testcaseid}/steps/{teststepid}
11. GET /testcases/testruns/{testrunid}
12. POST /testcases/testruns/
13. PUT  /testcases/testruns/{testrunid}
14. DELETE  /testcases/testruns/{testrunid}
15. GET /testcases/testruns
16. GET /testcases/{testcaseid}/defects
17. GET /testcases/{testcaseid}/steps/{teststepid}/defects
18. GET /testcases/{testcaseid}/steps/{teststepid}/defects/{defectid}

#### Test Suite Management
1. GET /testsuites
2. GET  /testsuites/{testsuiteid}
3. POST  /testsuites
4. PUT  /testsuites/{testsuiteid}
5. DELETE  /testsuites/{testsuiteid}
6. GET  /testsuites/testcases
7. POST /testsuites/testcases/{testcaseid}

#### Project Services
1. GET /projects
2. POST /projects
3. PUT  /projects/{projectid}
4. DELETE   /projects/{projectid}
5. GET  /projects/{projectid}

#### Release Services
1. GET /releases
2. POST /releases
3. PUT  /releases/{releaseid}
4. DELETE   /releases/{releaseid}
5. GET  /releases/{releaseid}
6. GET  /releases/{releaseid}/testsuites
7. GET  /releases/{releaseid}/testsuites/{testsuiteid}

#### Administration
1. TBD

#### Defect Management
1. GET  /defects
2. POST /defects    (will include testcaseid / teststepid)
3. PUT  /defects/{defectid}
4. DELETE   /defects/{defectid}
5. GET  /defects/{defectid}

#### Authorization services
1. POST /gettoken
2. POST /validationtoken