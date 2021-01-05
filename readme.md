### QualityManager
QualityManager is an open source test management tool written in ReactJS, NodeJS, Express and MSSQL.

Refer to packages/Client folder for ReactJS based front end written in JavaScript. This client uses redux for state management.  `Work in progress`

Refer to pacakges/Services folder for [https://github.com/pranavkakde/QualityManager/tree/master/packages/Services](APIs) that can be used by any client. These backend services are writing in JavaScript, NodeJS and Express.

This project uses lerna-js for building common package library. 

Build pipeline builds docker images for all services and pushes them in Docker Hub.
