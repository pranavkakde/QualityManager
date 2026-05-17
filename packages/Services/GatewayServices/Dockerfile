FROM qualitymanager-mainbuild:latest
COPY . packages/Services/GatewayServices/
EXPOSE 10104
CMD [ "npm", "--prefix", "packages/Services/GatewayServices", "start" ]
