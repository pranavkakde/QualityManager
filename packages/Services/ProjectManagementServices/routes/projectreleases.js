var caseModel = require("../Model/projectreleases");
var config = require("../config/config");
var lib = require("../lib/common");
var { validationResult } = require("express-validator");
var request = require("superagent");
var _ = require("underscore");
var project = require("./project");
const { ok } = require("assert");

exports.getCase = (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      next(lib.error(422, errors.array()));
      return;
    }
    caseModel.setConfig(config.database);
    isProjectRelease(req.params.releaseid, req.params.projectid)
      .then((data) => {
        res.status(200).json(data);
      })
      .catch((error) => {
        next(lib.error(404, "No data found"));
      });
  } catch (err) {
    next(lib.error(500, `${err}`));
  }
};
exports.deleteCase = (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      next(lib.error(422, errors.array()));
      return;
    }
    caseModel.setConfig(config.database);
    caseModel.delete(
      { projectid: req.params.projectid, releaseid: req.params.releaseid },
      (err, data) => {
        if (err) {
          if (lib.isEmptyObject(err)) {
            next(
              lib.error(
                404,
                `Project and associated Release details not found for ${req.params.releaseid}`
              )
            );
          } else {
            next(lib.error(500, `${err}`));
          }
        } else {
          res.status(200).json({
            success:
              "Project and associated Release record deleted succesfully",
            data,
          });
        }
      }
    );
  } catch (err) {
    next(lib.error(500, `${err}`));
  }
};
exports.updateCase = (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      next(lib.error(422, errors.array()));
      return;
    }
    caseModel.setConfig(config.database);
    isCase(req.params.releasesuiteid)
      .then((data) => {
        caseModel.update(
          { id: req.params.releasesuiteid },
          { projectid: req.body.projectid, releaseid: req.body.releaseid },
          (err, data) => {
            if (err) {
              if (lib.isEmptyObject(err)) {
                next(
                  lib.error(
                    404,
                    `Project and associated Release Id details are not found for ${req.params.releaseid}`
                  )
                );
              } else {
                next(lib.error(500, `${err}`));
              }
            } else {
              res.status(200).json({
                success:
                  "Project and associated Release Id record updated succesfully",
                data,
              });
            }
          }
        );
      })
      .catch((error) => {
        next(lib.error(404, "No data found"));
      });
  } catch (err) {
    next(lib.error(500, `${err}`));
  }
};
exports.addCase = (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      next(lib.error(422, errors.array()));
      return;
    }
    caseModel.setConfig(config.database);
    caseModel.insert(
      { projectid: req.params.projectid, releaseid: req.params.releaseid },
      (err, data) => {
        if (err) {
          next(lib.error(500, `${err}`));
        } else {
          res.status(201).json({
            success: "Project Release record inserted succesfully",
            data,
          });
        }
      }
    );
  } catch (err) {
    next(lib.error(500, `${err}`));
  }
};
function isProjectRelease(releaseid, projectid) {
  return new Promise((resolve, reject) => {
    caseModel.setConfig(config.database);
    caseModel.find(
      { releaseid: releaseid, projectid: projectid },
      (err, data) => {
        if (err) {
          if (lib.isEmptyObject(err)) {
            reject({
              error:
                "Project Id and associated Release Id is not found in database",
            });
          } else {
            reject({ error: `${err}` });
          }
        } else {
          if (lib.isEmptyObject(data)) {
            reject({
              error:
                "Project Id and associated Release Id is not found in database",
            });
          } else {
            resolve(data);
          }
        }
      }
    );
  });
}
async function getRels(projectid) {  
  return new Promise((resolve, reject) => {
    caseModel.setConfig(config.database);    
    caseModel.aggregate(
      {
        _field: [
          {
            _name: "_local.releaseid",
          },
        ],
        _filter: [
          {
            _field: [{ _name: "_local.projectid" }],
            _eq: projectid,
          },
        ],
      },
      (err, data) => {        
        if (_.isEmpty(data) && _.isEmpty(err)) {
          reject({error:"Project Id and associated Release Id is not found in database"});
        } else if (!_.isNull(err)) {
          reject({ error: `${JSON.stringify(err)}` });
        } else {
          resolve(data);
        }
      }
    );
  });
}
function isCase(projectreleaseid) {
  return new Promise((resolve, reject) => {
    caseModel.setConfig(config.database);
    caseModel.find({ projectreleaseid: projectreleaseid }, (err, data) => {
      if (err) {
        if (lib.isEmptyObject(err)) {
          reject({
            error:
              "Project Id and Release Id association is not found in database",
          });
        } else {
          reject({ error: "internal server error", err });
        }
      } else {
        if (lib.isEmptyObject(data)) {
          reject({
            error:
              "Project Id and Release Id association is not found in database",
          });
        } else {
          resolve(data);
        }
      }
    });
  });
}
exports.getTestCases = (req, res, next) => {
  res.status(200).json({
    message:
      "This service is still in progress. This will be completed once CRUD on Test Case Service is complete.",
  });
};
exports.getReleases = async function (req, res, next) {
  try {
    /*const errors = validationResult(req);
    if (!errors.isEmpty()) {
      next(lib.error(422, errors.array()));
      return;
    }*/
    caseModel.setConfig(config.database);
    getRels(req.params.projectid)
      .then((data) => {        
        var arr = [];
        for (const key in data) {
          const element = data[key].releaseid;
          arr.push(element);
        }
        const url = `${config.services.releases}releases`;
        const body = { releaseids: arr };        
        request
          .post(url)
          .set("Content-Type", "application/json")
          .set("Accept", "application/json")
          .send(body)
          .then((resp) => {
            res.status(200).json(resp.body);
          })
          .catch((error) => {
            next(lib.error(500, `${error}`));
          });
      })
      .catch((error) => {
        next(
          lib.error(
            404,
            `Could not find Release Id for Project Id ${req.params.projectid}`
          )
        );
      });
  } catch (err) {
    next(lib.error(500, `${JSON.stringify(err)}`));
  }
};
exports.getDefects = (req, res, next) => {
  res.status(200).json({
    message:
      "This service is still in progress. This will be completed once CRUD on Test Case Service is complete.",
  });
};
exports.getTestSuites = (req, res, next) => {
  try {
    var projectid = req.params.projectid;
    /*var found = false;        
    project.isProject(projectid)
      .then((projectdata) =>{
        console.log(`after first promise ${JSON.stringify(projectdata)}`);
        found=true;
      })
      .catch((error)=>{
        found=false;
        //res.status(404).json({error: `Project details not found in database for Project Id  ${req.params.projectid}`});
      });*/
    //if(found){
      getRels(projectid)
      .then((data) =>{
        var arr = [];
        for (const key in data) {
          const element = data[key].releaseid;
          arr.push(element);
        }
        const url = `${config.services.releases}releases/testsuites`;
        const body = { releaseids: arr };
        return request
        .post(url)
        .send(body)
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")      
      })
      .then((resp)=>{
        res.status(200).json(resp.body);
      })
      .catch((error) => {
        next(lib.error(404,`TestSuites not found for the Project Id  ${projectid}`));
      });
    /*}else{
      res.status(404).json({error: `Project details not found in database for Project Id  ${req.params.projectid}`});
    }*/
  } catch (err) {
    next(lib.error(500, `${JSON.stringify(err)}`));
  }
};
