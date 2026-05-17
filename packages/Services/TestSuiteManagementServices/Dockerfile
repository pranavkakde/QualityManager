FROM qualitymanager_mainbuild:latest

# Create app directory
WORKDIR /usr/src/app

# Copy shared resources
COPY ./packages/Services/shared /usr/src/app/packages/Services/shared

# Copy service code
COPY ./packages/Services/TestSuiteManagementServices /usr/src/app/packages/Services/TestSuiteManagementServices

WORKDIR /usr/src/app/packages/Services/TestSuiteManagementServices

RUN npm install --legacy-peer-deps && npm cache clean --force

EXPOSE 7780
CMD [ "npm", "start" ]
