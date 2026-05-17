FROM qualitymanager_mainbuild:latest
# Copy shared resources and the specific service code from the root context
COPY ./packages/Services/shared /usr/src/app/packages/Services/shared
COPY ./packages/Services/TestManagementServices /usr/src/app/packages/Services/TestManagementServices
WORKDIR /usr/src/app
CMD [ "npm", "--prefix", "packages/Services/TestManagementServices", "start" ]
