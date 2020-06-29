require("dotenv").config();
var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");
var cors = require("cors");
var morgan = require("morgan");
var rfs = require("rotating-file-stream");
var port = process.env.PORT || "7782";
var app = express();
var project = require("./routes/project");
var projectvalidator = require("./routes/validation/project");
var caseSuite = require("./routes/projectreleases");
var casevalidator = require("./routes/validation/projectreleases");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./doc/openapi.json");
//var auth = require('./routes/auth')
const session = require("express-session");

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

//Setup app
app.use(express.static("public"));
app.use(bodyParser.json({ limit: "5mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "5mb" }));
app.use(bodyParser.text());
app.use(bodyParser.json({ type: "application/json" }));
app.use(cors());

//create a session
/*app.use(session({
  secret: 'new session',
  resave: true,
  saveUninitialized: false,
  cookie: { maxAge: 60000 }}
));*/

// create a rotating access log
var accessLogStream = rfs("access.log", {
  interval: "1d", // rotate daily
  path: path.join(__dirname, "log"),
});

// setup the logger
app.use(morgan("combined", { stream: accessLogStream }));
/*app.use(auth.checkLogin)
app.use(auth.checkRequiredRole)*/

//########### Project management routes ###############
app.get(
  "/project/:projectid",
  projectvalidator.validate("getProject"),
  project.getProject
);
app.delete(
  "/project/:projectid",
  projectvalidator.validate("deleteProject"),
  project.deleteProject
);
app.put(
  "/project/:projectid",
  projectvalidator.validate("updateProject"),
  project.updateProject
);
app.post(
  "/project",
  projectvalidator.validate("addProject"),
  project.addProject
);

//########### Project and Release associative routes ######################
app.get(
  "/project/:projectid/release/:releaseid",
  casevalidator.validate("getCase"),
  caseSuite.getCase
);
app.post(
  "/project/:projectid/release/:releaseid",
  casevalidator.validate("addCase"),
  caseSuite.addCase
);
app.delete(
  "/project/:projectid/release/:releaseid",
  casevalidator.validate("deleteCase"),
  caseSuite.deleteCase
);
app.put(
  "/projectrelease/:releasesuiteid",
  casevalidator.validate("updateCase"),
  caseSuite.updateCase
);

//########### Project and Release associative routes ######################
////#region
app.get("/project/:projectid/releases", caseSuite.getReleases);
app.get(
  "/project/:projectid/testsuites",
  projectvalidator.validate("getProject"),
  caseSuite.getTestSuites
);
app.get("/project/:projectid/testcases", caseSuite.getTestCases);
app.get("/project/:projectid/defects", caseSuite.getDefects);
////#endregion

////#region
app.get("/isalive", (req, res) => {
  res.send("ok").status(200);
});
////#endregion

app.use((req, res, next) => {
  const error = {
    error: {
      message: "No endpoint found for this request",
      status: 501,
    },
  };
  next(error);
});

app.use((err, req, res, next) => {
  res.status(err.error.status);
  res.json({ error: err.error.message });
});
app.listen(port, () => {
  console.log(`Starting server on port ${port}`);
});

module.exports = app;
