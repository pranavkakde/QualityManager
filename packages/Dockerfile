FROM node:10

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./
COPY ./packages/Services/ClientManagementServices/package*.json ./packages/Services/ClientManagementServices/package*.json
COPY ./packages/Services/DefectManagementServices/package*.json ./packages/Services/DefectManagementServices/package*.json
COPY lerna.json .
RUN npm install -g lerna

RUN lerna bootstrap --hoist

# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
#COPY . .
RUN cd ./packages/Services/ClientManagementServices/ && npm install 
RUN cd ./packages/Services/DefectManagementServices/ && npm install 
