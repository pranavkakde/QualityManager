FROM pranavkakde/qualitymanager_mainbuild as base
#FROM alpine:latest as stage
#WORKDIR /usr/src/app
#COPY --from=base /usr/src/app/node_modules/ ./node_modules/
COPY  . ./Services/ReleaseManagement/
CMD [ "npm", "--prefix", "./Services/ReleaseManagement", "start" ]
