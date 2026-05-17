var suiteModel = require('../Model/testsuite')
var caseSuiteModel = require('../Model/testsuitecase')
var config = require('../config/config')
var lib = require('../lib/common')
var { validationResult } = require('express-validator')

exports.getSuite = (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            next(lib.error(422, errors.array()));
            return;
        }
        suiteModel.setConfig(config.database)
        isSuite(req.params.testsuiteid).then(data => {
            res.status(200).json(data[0]);
        }).catch(error => {
            next(lib.error(404, `Test Suite Id ${req.params.testsuiteid} not found in database.`));
        })
    } catch (err) {
        next(lib.error(500, `Internal Server Error ${err}`));
    }
}
exports.deleteSuite = (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            next(lib.error(422, errors.array()));
            return;
        }
        suiteModel.setConfig(config.database)
        suiteModel.delete({ testsuiteid: req.params.testsuiteid }, (err, data) => {
            if (err) {
                if (lib.isEmptyObject(err)) {
                    next(lib.error(404, `Test Suite Id ${req.params.testsuiteid} not found in database.`));
                } else {
                    next(lib.error(500, `Internal Server Error ${err}`));
                }
            } else {
                res.status(200).json({ success: "TestSuite record deleted succesfully", data });
            }
        })
    } catch (err) {
        next(lib.error(500, `Internal Server Error ${err}`));
    }
}
exports.updateSuite = (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            next(lib.error(422, errors.array()));
            return;
        }
        suiteModel.setConfig(config.database)
        isSuite(req.params.testsuiteid).then(data => {
            suiteModel.update({ testsuiteid: req.params.testsuiteid }, {
                name: req.body.name, description: req.body.description,
                statusid: req.body.statusid, releaseid: req.body.releaseid
            }, (err, data) => {
                if (err) {
                    if (lib.isEmptyObject(err)) {
                        next(lib.error(404, `TestSuite details not found for Test Suite Id ${req.params.testsuiteid}`));
                    } else {
                        next(lib.error(500, `Internal Server Error ${err}`));
                    }
                } else {
                    res.status(200).json({ success: "TestSuite record updated succesfully", data });
                }
            })
        }).catch(error => {
            next(lib.error(404, `TestSuite details not found for Test Suite Id ${req.params.testsuiteid}`));
        })
    } catch (err) {
        next(lib.error(500, `Internal Server Error ${err}`));
    }
}
exports.addSuite = (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            next(lib.error(422, errors.array()));
            return;
        }
        suiteModel.setConfig(config.database)
        suiteModel.insert({
            name: req.body.name, description: req.body.description,
            statusid: req.body.statusid, releaseid: req.body.releaseid
        }, (err, data) => {
            if (err) {
                next(lib.error(500, `Internal Server Error ${err}`));
            } else {
                res.status(201).json({ success: "TestSuite record inserted succesfully", data });
            }
        })
    } catch (err) {
        next(lib.error(500, `Internal Server Error ${err}`));
    }
}
function isSuite(testsuiteid) {
    return new Promise((resolve, reject) => {
        suiteModel.setConfig(config.database)
        suiteModel.find({ testsuiteid: testsuiteid }, (err, data) => {
            if (err) {
                if (lib.isEmptyObject(err)) {
                    reject({ error: "testsuiteid id is not found in database" })
                } else {
                    reject({ error: "internal server error", err })
                }
            } else {
                if (lib.isEmptyObject(data)) {
                    reject({ error: "testsuiteid id is not found in database" })
                } else {
                    resolve(data)
                }
            }
        });
    })
}
exports.getTestCases = (req, res, next) => {
    try {
        caseSuiteModel.setConfig(config.database);
        caseSuiteModel.find({ testsuiteid: req.params.testsuiteid }, async (err, mappings) => {
            if (err) {
                next(lib.error(500, `Internal Server Error ${err}`));
                return;
            }
            const data = Array.isArray(mappings) ? mappings : [];
            if (data.length === 0) {
                res.status(200).json([]);
                return;
            }
            const arr = data.map(item => item.testcaseid);
            try {
                const serviceUrl = process.env.TESTMGMT_SERVICES_URL || 'http://localhost:7784';
                const url = `${serviceUrl}/filter`;
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authorization': req.headers.authorization || ''
                    },
                    body: JSON.stringify({ "testcases": arr })
                });
                if (!response.ok) {
                    throw new Error(`Service returned status ${response.status}`);
                }
                const result = await response.json();
                res.status(200).json(result);
            } catch (fetchErr) {
                next(lib.error(500, `Internal Service Communication Error ${fetchErr.message}`));
            }
        });
    } catch (err) {
        next(lib.error(500, `Internal Server Error ${err}`));
    }
}
exports.filterSuite = (req, res, next) => {
    suiteModel.setConfig(config.database)
    var sArray = req.body.testsuites
    console.log(sArray)
    /*suiteModel.aggregate(
        {
            _field: 
                [
                    {
                        _name: '_local.all'
                    }
                ],
            _filter:[       
                {
                    _field:[{_name:'testsuiteid'}],
                    _in: sArray    
                }
            ]
            }*/
    suiteModel.find({ testsuiteid: sArray }
        , function (err, data) {
            if (err) {
                next(lib.error(500, `Internal Server Error ${err}`));
            } else {
                res.status(200).json(data);
            }
        });
}
exports.getSuitesByRelease = (req, res, next) => {
    try {
        suiteModel.setConfig(config.database);
        suiteModel.find({ releaseid: req.params.releaseid }, (err, data) => {
            if (err) {
                if (lib.isEmptyObject(err)) {
                    res.status(200).json([]);
                } else {
                    next(lib.error(500, `Internal Server Error ${err}`));
                }
            } else {
                res.status(200).json(Array.isArray(data) ? data : []);
            }
        });
    } catch (err) {
        next(lib.error(500, `Internal Server Error ${err}`));
    }
}