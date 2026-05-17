FROM qualitymanager_mainbuild:latest

# Create app directory
WORKDIR /usr/src/app

# Copy shared resources
COPY ./packages/Services/shared /usr/src/app/packages/Services/shared

# Copy service code
COPY ./packages/Services/ClientManagementServices /usr/src/app/packages/Services/ClientManagementServices

WORKDIR /usr/src/app/packages/Services/ClientManagementServices

RUN npm install --legacy-peer-deps && npm cache clean --force

EXPOSE 7778
CMD [ "npm", "start" ]
