-- Mock Data for QualityManager

-- UserGroups
INSERT INTO [dbo].[UserGroup] ([GroupId], [GroupName], [IsAdmin]) VALUES 
(1, 'Administrators', 1),
(2, 'Testers', 0),
(3, 'Developers', 0);

-- UserProfiles (Password stored as plain text or mock hash depending on your system, using simple strings here)
INSERT INTO [dbo].[UserProfile] ([UserId], [UserName], [Password], [GroupId]) VALUES 
(1, 'admin', 'admin123', 1),
(2, 'pranav', 'password', 2),
(3, 'dev1', 'devpass', 3);

-- ProjectMaster
INSERT INTO [dbo].[ProjectMaster] ([projectid], [name], [description]) VALUES 
(1, 'Alpha Project', 'Main e-commerce platform testing'),
(2, 'Beta Project', 'Internal HR portal');

-- ReleaseMaster
INSERT INTO [dbo].[ReleaseMaster] ([releaseid], [name], [description], [iscurrentrelease]) VALUES 
(1, 'v1.0', 'Initial MVP Release', 0),
(2, 'v1.1', 'Bug fixes and performance improvements', 1);

-- projectreleases
INSERT INTO [dbo].[projectreleases] ([projectreleaseid], [releaseid], [projectid]) VALUES 
(1, 1, 1),
(2, 2, 1);

-- testsuites
INSERT INTO [dbo].[testsuites] ([testsuiteid], [name], [description], [statusid], [releaseid]) VALUES 
(1, 'Authentication Suite', 'Test cases related to user login and registration', 1, 1),
(2, 'Checkout Suite', 'Test cases for shopping cart and payment', 1, 1);

-- releasesuites
INSERT INTO [dbo].[releasesuites] ([id], [releaseid], [testsuiteid]) VALUES 
(1, 1, 1),
(2, 1, 2);

-- testcases
INSERT INTO [dbo].[testcases] ([testcaseid], [name], [description], [versionid], [prerequisite], [statusid], [author]) VALUES 
(1, 'Valid User Login', 'Ensure a user can log in with correct credentials', 'v1', 'User account exists', 1, 2),
(2, 'Invalid Password Login', 'Ensure user is rejected with incorrect password', 'v1', 'None', 1, 2),
(3, 'Add Item to Cart', 'Ensure item is added to cart successfully', 'v1', 'User logged in', 1, 2);

-- testcasesuite
INSERT INTO [dbo].[testcasesuite] ([id], [testcaseid], [testsuiteid]) VALUES 
(1, 1, 1),
(2, 2, 1),
(3, 3, 2);

-- teststeps
INSERT INTO [dbo].[teststeps] ([stepid], [stepname], [action], [verification], [testcaseid], [statusid]) VALUES 
(1, 'Enter username', 'Type valid username in the username field', 'Username appears in field', 1, 1),
(2, 'Enter password', 'Type valid password in the password field', 'Password masked in field', 1, 1),
(3, 'Click Login', 'Click the login button', 'User is redirected to dashboard', 1, 1),
(4, 'Enter incorrect pass', 'Type invalid password', 'Password masked', 2, 1),
(5, 'Click Login', 'Click the login button', 'Error message "Invalid credentials" shown', 2, 1);

-- testrun
INSERT INTO [dbo].[testrun] ([testrunid], [name], [runtypeid], [startdate], [enddate], [userid], [testrunstatusid], [testcaseid]) VALUES 
(1, 'Sprint 1 Regression', 1, '2026-05-01T00:00:00Z', '2026-05-02T00:00:00Z', 2, 2, 1),
(2, 'Sprint 1 Regression', 1, '2026-05-01T00:00:00Z', '2026-05-02T00:00:00Z', 2, 1, 2);

-- defects
INSERT INTO [dbo].[defects] ([defectid], [subject], [description], [assignedto], [createdby], [createddate], [defectstatusid], [closedby]) VALUES 
(1, 'Login button unresponsive on mobile', 'The login button does not trigger any action on Safari iOS', 3, 2, '2026-05-01T10:00:00Z', 1, NULL),
(2, 'Typo in error message', 'Error says "Invalidd" instead of "Invalid"', 3, 2, '2026-05-02T11:30:00Z', 3, 1);

-- Services
INSERT INTO [dbo].[Services] ([_id], [name], [serviceEndpoint], [resouceName]) VALUES 
('auth', 'AuthServices', 'http://localhost:7777', 'User Auth'),
('test', 'TestManagement', 'http://localhost:7778', 'Test Execution'),
('defect', 'DefectManagement', 'http://localhost:7779', 'Defect Tracking');

-- Clients
INSERT INTO [dbo].[Clients] ([ClientId], [ClientName], [SecretKey], [token], [password]) VALUES 
(1, 'Web Frontend', 'secret-key-123', 'initial-token-abc', 'clientpass');
