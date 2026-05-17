FROM qualitymanager_mainbuild:latest

# Create app directory
WORKDIR /usr/src/app

# Copy shared resources
COPY ./packages/Services/shared /usr/src/app/packages/Services/shared

# Copy service code
COPY ./packages/Services/DefectManagementServices /usr/src/app/packages/Services/DefectManagementServices

WORKDIR /usr/src/app/packages/Services/DefectManagementServices

RUN npm install --legacy-peer-deps && npm cache clean --force

EXPOSE 7779
CMD [ "npm", "start" ]
