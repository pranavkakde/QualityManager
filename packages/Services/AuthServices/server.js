require('dotenv').config()
var express = require("express");
var path = require("path");
var bodyParser = require('body-parser');
var cors = require('cors')
var morgan = require('morgan')
var rfs = require("rotating-file-stream").createStream;
var port = process.env.PORT || '8181'
var app = express();
var authvalidator = require('./routes/validation/auth')
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./doc/doc.json');
var auth = require('./routes/auth')
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

//Setup app
app.use(express.static('public'));
app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '5mb' }));
app.use(bodyParser.text());
app.use(bodyParser.json({ type: 'application/json' }));
app.use(cors())

// create a rotating access log
var accessLogStream = rfs('access.log', {
  interval: '1d', // rotate daily
  path: path.join(__dirname, 'log')
})

// setup the logger
app.use(morgan('combined', { stream: accessLogStream }))

//########### Auth management routes ###############

app.post("/auth/gettoken", authvalidator.validate('gettoken'), auth.gettoken)
app.post("/auth/validatetoken", authvalidator.validate('validatetoken'), auth.validatetoken)
//update password


app.get("/auth/isalive", (req, res) => {
  res.send("ok").status(200);
})
app.use((req, res, next) => {
  const error = {
    error: {
      "message": "No endpoint found for this request",
      "status": 501
    }
  }
  next(error);
})

app.use((err, req, res, next) => {
  // Enhanced Telemetry / Logging
  console.error('\n================ ERROR ================');
  console.error('Time:', new Date().toISOString());
  console.error('Path:', req.method, req.originalUrl);
  console.error('Body:', JSON.stringify(req.body, null, 2));
  console.error('Params:', JSON.stringify(req.params, null, 2));
  console.error('Query:', JSON.stringify(req.query, null, 2));
  console.error('---');
  console.error(process.env.DBINSTANCE);
  console.error(process.env.DBUSER);
  console.error(process.env.DBPASSWORD);
  console.error(process.env.DATABASE);
  if (err.error && err.error.status) {
    // This is a custom lib.error
    console.error('Custom Error Message:', err.error.message);
    console.error('Custom Error Status:', err.error.status);
    if (err.error.innerError) console.error('Inner Error:', err.error.innerError);
    console.error('=======================================\n');
    res.status(err.error.status).json({ "error": err.error.message });
  } else {
    // This is an unhandled, raw Node.js/DB crash
    console.error('RAW UNHANDLED ERROR:');
    console.error(err.stack || err);
    console.error('=======================================\n');
    res.status(500).json({ "error": "Internal Server Error", "details": err.message });
  }
});
app.listen(port, () => { console.log(`Starting server on port ${port}`) })

module.exports = app