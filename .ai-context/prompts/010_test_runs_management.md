# Test Runs Management

## Overview
This document specifies the rules and logic for managing **Test Runs**, **Test Cases Execution**, and **Step Level Status Tracking** within a suite-scoped context.

## Test Run Entity Hierarchy
1. **Test Run (`dbo.testrun`)**: The main execution record representing a set of test cases run together against a specific Test Suite.
2. **Test Run Cases (`dbo.testruncases`)**: Mapping of test cases included in the test run. Tracks the overall execution status of the case in the run context.
3. **Test Run Steps (`dbo.testrunsteps`)**: Detailed snapshot mapping of the active test steps of a test case at the moment the test run was created. 

## Automated Status Calculation Rules

When step execution statuses are updated, the statuses cascade up:

**Test Case Run Status (`testruncases.status`)**:
- If ANY step is `Failed`, case status is `Failed`.
- If ANY step is `Blocked`, case status is `Blocked`.
- If ANY step is `On Hold`, case status is `On Hold`.
- If ALL steps are `Pass` or `Complete`, case status is `Passed`.
- If ALL steps are `New`, case status is `New`.
- Otherwise, case status is `In Progress`.

**Overall Test Run Status (`testrun.status`)**:
- If ALL cases are `New`, run status is `New`.
- If ALL cases are `Passed`, `Failed`, or `Blocked`, run status is `Complete`.
- Otherwise, run status is `In Progress`.

## Frontend Integration
- Test runs dashboard must allow filtering by Suite, Tag, Status, and Creator.
- New test runs take a snapshot of test cases and their test steps to prevent historical step updates from altering past test run execution records.
