FROM node:12-alpine as base
# Install nodejs
RUN apk update
RUN apk add --update python make g++\
   && rm -rf /var/cache/apk/*
# Create app directory
WORKDIR /usr/src/app
#Install lerna
RUN npm install -g lerna

FROM base as consolidated

WORKDIR /usr/src/app

# Install app dependencies
COPY package.json ./
COPY ./packages/Services/AuthServices/package.json ./Services/AuthServices/package.json
COPY ./packages/Services/ClientManagementServices/package.json ./Services/ClientManagementServices/package.json
COPY ./packages/Services/DefectManagementServices/package.json ./Services/DefectManagementServices/package.json
COPY ./packages/Services/GatewayServices/package.json ./Services/GatewayServices/package.json
COPY ./packages/Services/ProjectManagementServices/package.json ./Services/ProjectManagementServices/package.json
COPY ./packages/Services/ReleaseManagementServices/package.json ./Services/ReleaseManagementServices/package.json
COPY ./packages/Services/TestManagementServices/package.json ./Services/TestManagementServices/package.json
COPY ./packages/Services/TestSuiteManagementServices/package.json ./Services/TestSuiteManagementServices/package.json
COPY ./packages/Services/UserManagementServices/package.json ./Services/UserManagementServices/package.json
COPY lerna.json .

RUN lerna bootstrap --hoist

