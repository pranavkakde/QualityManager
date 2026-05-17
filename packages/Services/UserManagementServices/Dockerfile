FROM qualitymanager_mainbuild:latest
# Copy shared resources and the specific service code from the root context
COPY ./packages/Services/shared /usr/src/app/packages/Services/shared
COPY ./packages/Services/UserManagementServices /usr/src/app/packages/Services/UserManagementServices
WORKDIR /usr/src/app
CMD [ "npm", "--prefix", "packages/Services/UserManagementServices", "start" ]
