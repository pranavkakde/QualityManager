FROM node:10
# Create app directory
WORKDIR /usr/src/app
# Install app dependencies
COPY package.json ./
COPY ./packages/Services/ClientManagementServices/package.json ./Services/ClientManagementServices/package.json
COPY ./packages/Services/DefectManagementServices/package.json ./Services/DefectManagementServices/package.json
COPY ./packages/Services/ProjectManagementServices/package.json ./Services/ProjectManagementServices/package.json
COPY ./packages/Services/ReleaseManagementServices/package.json ./Services/ReleaseManagementServices/package.json
COPY ./packages/Services/TestManagementServices/package.json ./Services/TestManagementServices/package.json
COPY ./packages/Services/TestSuiteManagementServices/package.json ./Services/TestSuiteManagementServices/package.json
COPY ./packages/Services/UserManagementServices/package.json ./Services/UserManagementServices/package.json
COPY lerna.json .
#Run lerna
RUN npm install -g lerna
RUN lerna bootstrap --hoist --no-ci