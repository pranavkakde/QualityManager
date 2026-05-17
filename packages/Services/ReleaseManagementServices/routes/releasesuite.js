var config = require('../config/config')
var caseModel = require('../Model/releasesuite')
var lib = require('../lib/common')
var { validationResult } = require('express-validator')
var request = require('superagent')

exports.getCase = (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            next(lib.error(422, errors.array()));
            return;
        }
        isRel(req.params.releaseid, req.params.testsuiteid).then(data => {
            res.status(200).json(data);
        }).catch(error => {
            next(lib.error(404, "No data found"));
        })
    } catch (err) {
        next(lib.error(500, `internal server error ${err}`));
    }
}
exports.deleteCase = (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            next(lib.error(422, errors.array()));
            return;
        }
        caseModel.setConfig(config.database)
        caseModel.delete({ testsuiteid: req.params.testsuiteid, releaseid: req.params.releaseid }, (err, data) => {
            if (err) {
                if (lib.isEmptyObject(err)) {
                    res.status(400).json({ error: `Release and associated Test Suite details not found for ${req.params.releaseid}` });
                } else {
                    next(lib.error(500, `internal server error ${err}`));
                }
            } else {
                res.status(200).json({ success: "Release and associated Test Suite record deleted succesfully", data });
            }
        })
    } catch (err) {
        next(lib.error(500, `internal server error ${err}`));
    }
}
exports.updateCase = (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            next(lib.error(422, errors.array()));
            return;
        }
        isCase(req.params.releasesuiteid).then(data => {
            caseModel.setConfig(config.database)
            caseModel.update({ id: req.params.releasesuiteid }, {
                testsuiteid: req.body.testsuiteid, releaseid: req.body.releaseid
            }, (err, data) => {
                if (err) {
                    if (lib.isEmptyObject(err)) {
                        res.status(400).json({ error: `Release and associated Test Suite id details not found for ${req.params.releaseid}` });
                    } else {
                        next(lib.error(500, `internal server error ${err}`));
                    }
                } else {
                    res.status(200).json({ success: "Release and associated Test Suite record updated succesfully", data });
                }
            })
        }).catch(error => {
            next(lib.error(404, "No data found"));
        })
    } catch (err) {
        next(lib.error(500, `internal server error ${err}`));
    }
}
exports.addCase = (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            next(lib.error(422, errors.array()));
            return;
        }
        caseModel.setConfig(config.database)
        caseModel.insert({
            testsuiteid: req.params.testsuiteid, releaseid: req.params.releaseid
        }, (err, data) => {
            if (err) {
                next(lib.error(500, `internal server error ${err}`));
            } else {
                res.status(201).json({ success: "Release and Test Suite record inserted succesfully", data });
            }
        })
    } catch (err) {
        next(lib.error(500, `internal server error ${err}`));
    }
}
function isRel(releaseid, testsuiteid) {
    return new Promise((resolve, reject) => {
        caseModel.setConfig(config.database)
        caseModel.find({ releaseid: releaseid, testsuiteid: testsuiteid }, (err, data) => {
            if (err) {
                if (lib.isEmptyObject(err)) {
                    reject(404, { error: "Release Id and associated Test Suite is not found in database" })
                } else {
                    reject({ error: "internal server error", err })
                }
            } else {
                if (lib.isEmptyObject(data)) {
                    reject({ error: "Release Id and associated Test Suite is not found in database" })
                } else {
                    resolve(data)
                }
            }
        });
    })
}
async function getTestSuites(releaseid) {
    return new Promise((resolve, reject) => {
        caseModel.setConfig(config.database)
        caseModel.find({ releaseid: releaseid }, (err, data) => {
            if (err) {
                console.log("========== RAW ERROR ==========");
                console.dir(err, { depth: null });
                console.log("NAME:", err?.name);
                console.log("MESSAGE:", err?.message);
                console.log("STACK:", err?.stack);

                console.log("PARENT:", err?.parent);
                console.log("ORIGINAL:", err?.original);
                if (lib.isEmptyObject(err)) {
                    reject({ error: "Release Id and associated Test Suite is not found in database" })
                } else {
                    reject({ error: "internal server error", err })
                }
            } else {
                console.log(`data from db in gettestsuies ${JSON.stringify(data)}`)
                if (!data || data.length === 0) {
                    reject({ error: "Release Id and associated Test Suite is not found in database" })
                } else {
                    resolve(data)
                }
            }
        });
    })
}
function isCase(releasesuiteid) {
    return new Promise((resolve, reject) => {
        caseModel.setConfig(config.database)
        caseModel.find({ id: releasesuiteid }, (err, data) => {
            if (err) {
                if (lib.isEmptyObject(err)) {
                    reject({ error: "Release Id and Test Sutie association is not found in database" })
                } else {
                    reject({ error: "internal server error", err })
                }
            } else {
                if (lib.isEmptyObject(data)) {
                    reject({ error: "Release Id and Test Sutie association is not found in database" })
                } else {
                    resolve(data)
                }
            }
        });
    })
}
exports.getTestCases = (req, res, next) => {
    res.status(200).json({ "message": "This service is still in progress. This will be completed once CRUD on Test Case Service is complete." })
}
exports.getTestSuites = async function (req, res, next) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            next(lib.error(422, errors.array()));
            return;
        }
        let data;
        try {
            data = await getTestSuites(req.params.releaseid);
            console.log(`data from db in gettestsuies ${data}`);
        } catch (err) {
            console.log(`error from db in gettestsuies ${err.error} \n ${err.parent.message}`);
            next(lib.error(404, err.error));
            return;
        }
        const dataArray = Array.isArray(data) ? data : [];
        if (dataArray.length === 0) {
            next(lib.error(404, err.error));
            return;
        }
        var arr = []
        for (const key in dataArray) {
            const element = dataArray[key].testsuiteid;
            arr.push(element)
        }
        const url = `${config.services.testsuite}testsuites`
        const body = { "testsuites": arr }
        console.log(`url ${url}`);
        console.log(`body ${body}`);
        const resp = await request
            .post(url)
            .send(body)
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .set('Authorization', req.headers.authorization);
        res.status(200).json(resp.body);
    } catch (err) {
        next(lib.error(500, `internal server error ${err}`));
    }
}
exports.getDefects = (req, res, next) => {
    res.status(200).json({ "message": "This service is still in progress. This will be completed once CRUD on Test Case Service is complete." })
}
exports.filterReleasesTestSuites = (req, res, next) => {
    try {
        /*const errors = validationResult(req);
        if (!errors.isEmpty()) {
            next(lib.error(422,errors.array()));
            return;
        }*/
        caseModel.setConfig(config.database)
        caseModel.join(
            {
                _join: [{
                    _localkey: 'testsuiteid',
                    _foreignkey: 'testsuiteid',
                    _foreignTable: 'dbo.[testsuites]',
                    _type: 'inner',
                    _name: '$join1'
                }],
                _field:
                    [
                        {
                            _name: '_local.releaseid'
                        },
                        {
                            _name: '_foreign.all',
                            _join: '$join1'
                        }
                    ],
                _filter: [
                    {
                        _field: [{ _name: '_local.releaseid' }],
                        _in: [req.body.releaseids]
                    }
                ]
            }
            , (err, data) => {
                if (err) {
                    if (lib.isEmptyObject(err)) {
                        next(lib.error(404, "Release Id and associated Test Suite is not found in database"));
                    } else {
                        next(lib.error(500, `internal server error${err}`));
                    }
                } else {
                    if (lib.isEmptyObject(data)) {
                        next(lib.error(500, "Release Id and associated Test Suite is not found in database"));
                    } else {
                        res.status(200).json(data);
                    }
                }
            });
    } catch (err) {
        next(lib.error(500, `internal server error ${err}`));
    }
}