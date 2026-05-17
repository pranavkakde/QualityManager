FROM qualitymanager_mainbuild:latest

# Create app directory
WORKDIR /usr/src/app

# Copy shared resources
COPY ./packages/Services/shared /usr/src/app/packages/Services/shared

# Copy service code
COPY ./packages/Services/ProjectManagementServices /usr/src/app/packages/Services/ProjectManagementServices

WORKDIR /usr/src/app/packages/Services/ProjectManagementServices

RUN npm install --legacy-peer-deps && npm cache clean --force

EXPOSE 7782
CMD [ "npm", "start" ]
