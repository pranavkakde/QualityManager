var userProjectModel = require('../Model/userproject')
var config = require('../config/config')
var lib = require('../lib/common')

exports.getUserProjects = (req, res, next) => {
    userProjectModel.setConfig(config.database)
    userProjectModel.find({ userid: req.params.userid }, (err, data) => {
        if (err) {
            next(lib.error(500, `internal server error ${err}`));
        } else {
            res.status(200).json(data);
        }
    })
}

exports.addUserProject = (req, res, next) => {
    userProjectModel.setConfig(config.database)
    userProjectModel.insert({ userid: req.body.userid, projectid: req.body.projectid }, (err, data) => {
        if (err) {
            next(lib.error(500, `internal server error ${err}`));
        } else {
            res.status(201).json(data);
        }
    })
}

exports.deleteUserProject = (req, res, next) => {
    userProjectModel.setConfig(config.database)
    userProjectModel.delete({ userid: req.params.userid, projectid: req.params.projectid }, (err, data) => {
        if (err) {
            next(lib.error(500, `internal server error ${err}`));
        } else {
            res.status(204).json({ success: "Mapping deleted successfully" });
        }
    })
}
