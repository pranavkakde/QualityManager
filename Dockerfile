# --- Stage 1: Build & Install ---
FROM node:20-alpine as builder
# Install native build tools (python, make, g++) temporarily
RUN apk add --no-cache python3 make g++

WORKDIR /usr/src/app

# Install app dependencies
COPY package.json lerna.json ./
COPY ./packages/Services/ClientManagementServices/package.json ./packages/Services/ClientManagementServices/package.json
COPY ./packages/Services/DefectManagementServices/package.json ./packages/Services/DefectManagementServices/package.json
COPY ./packages/Services/ProjectManagementServices/package.json ./packages/Services/ProjectManagementServices/package.json
COPY ./packages/Services/ReleaseManagementServices/package.json ./packages/Services/ReleaseManagementServices/package.json
COPY ./packages/Services/TestManagementServices/package.json ./packages/Services/TestManagementServices/package.json
COPY ./packages/Services/TestSuiteManagementServices/package.json ./packages/Services/TestSuiteManagementServices/package.json
COPY ./packages/Services/UserManagementServices/package.json ./packages/Services/UserManagementServices/package.json

# Install dependencies (only production if possible, but leaving all for monorepo safety)
RUN npm install --legacy-peer-deps && npm cache clean --force

# --- Stage 2: Lean Runner ---
FROM node:20-alpine as consolidated
WORKDIR /usr/src/app

# Copy ONLY the installed node_modules and package.jsons from the builder stage
# This completely discards the Python/C++ compiler toolchain from the final image!
COPY --from=builder /usr/src/app /usr/src/app

# Copy service source code
COPY ./packages ./packages
