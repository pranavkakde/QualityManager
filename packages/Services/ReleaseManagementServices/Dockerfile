FROM qualitymanager_mainbuild:latest

# Create app directory
WORKDIR /usr/src/app

# Copy shared resources
COPY ./packages/Services/shared /usr/src/app/packages/Services/shared

# Copy service code
COPY ./packages/Services/ReleaseManagementServices /usr/src/app/packages/Services/ReleaseManagementServices

WORKDIR /usr/src/app/packages/Services/ReleaseManagementServices

RUN npm install --legacy-peer-deps && npm cache clean --force

EXPOSE 7781
CMD [ "npm", "start" ]
