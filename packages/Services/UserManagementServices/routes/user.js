var userModel = require('../Model/user')
var config = require('../config/config')
var lib = require('../lib/common')
var bcrypt = require('bcryptjs')
var { validationResult } = require('express-validator')

const jwt = require('jsonwebtoken');

function getAsciiPwd(password) {
    return Buffer.from(password, 'base64').toString('ascii')
}
function getBase64Pwd(password) {
    return Buffer.from(password).toString('base64')
}
function isUser(username, password) {
    return new Promise((resolve, reject) => {
        try {
            userModel.setConfig(config.database)
            console.log(`[AUTH] Attempt: ${username}`);
            
            userModel.find({ UserName: username }, (err, data) => {
                if (err) {
                    console.error('[AUTH] DB Error:', err);
                    return reject({ error: "Database error: " + (err.message || "Unknown error") });
                }
                
                if (!data || data.length === 0) {
                    console.log(`[AUTH] User not found: ${username}`);
                    return reject({ error: "User not found" });
                }
                
                const user = data[0];
                const dbPassword = user.Password;
                let match = false;
                
                console.log(`[AUTH] User ${username} found. Checking password...`);

                // 1. Plain text check
                if (password === dbPassword) {
                    match = true;
                } 
                // 2. Bcrypt check
                else {
                    try {
                        match = bcrypt.compareSync(password, dbPassword);
                    } catch(e) {
                        console.log('[AUTH] Bcrypt error:', e.message);
                        match = false;
                    }
                }

                if (match) {
                    console.log(`[AUTH] Success: ${username}`);
                    resolve(user);
                } else {
                    console.log(`[AUTH] Password mismatch for: ${username}`);
                    reject({ error: "Invalid password" });
                }
            });
        } catch (fatal) {
            console.error('[AUTH] Fatal setup error:', fatal);
            reject({ error: "Auth service setup error" });
        }
    });
}

exports.login = async (req, res, next) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: "Username and password are required" });
        }

        const user = await isUser(username, password);
        
        // Generate a real JWT
        const token = jwt.sign(
            { sub: user.UserId, preferred_username: user.UserName, role: user.GroupId === 1 ? 'admin' : 'user' },
            process.env.JWT_SECRET || 'qualitymanager-secret',
            { expiresIn: '8h' }
        );

        res.status(200).json({
            token,
            username: user.UserName,
            role: user.GroupId === 1 ? 'admin' : 'user'
        });
    } catch (err) {
        next(lib.error(401, err.error || "Authentication failed"));
    }
}

exports.getUser = (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            next(lib.error(422, errors.array()));
            //return;
        }
        userModel.setConfig(config.database)
        userModel.find({ UserName: req.params.username }, (err, data) => {
            if (err) {
                if (lib.isEmptyObject(err)) {
                    next(lib.error(404, `user details not found for ${req.params.username}`));
                } else {
                    next(lib.error(500, `internal server error ${err}`));
                }
            } else {
                res.status(200).json(data);
            }
        })
    } catch (err) {
        next(lib.error(500, `internal server error ${err}`));
    }
}
exports.deleteUser = (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            next(lib.error(422, errors.array()));
            return;
        }
        userModel.setConfig(config.database)
        userModel.delete({ UserName: req.params.username }, (err, data) => {
            if (err) {
                if (lib.isEmptyObject(err)) {
                    next(lib.error(404, `user details not found for ${req.params.username}`));
                } else {
                    next(lib.error(500, `internal server error ${err}`));
                }
            } else {
                res.status(204).json({ success: "User record deleted succesfully" });
            }
        })
    } catch (err) {
        next(lib.error(500, `internal server error ${err}`));
    }
}
exports.updateUser = (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            next(lib.error(422, errors.array()));
            return;
        }
        userModel.setConfig(config.database)
        var password = req.body.password
        /* var encryptedSecretKey = bcrypt.hashSync(password, 10, function (err, hash) {
            if (err) {
                return ({ error: "secretkey encrypytion failed" })
            } 
        }); */
        isUser(req.params.username, password).then(data => {
            userModel.update({ UserName: req.params.username }, { UserName: req.body.UserName, Password: encryptedSecretKey, GroupId: req.body.groupid }, (err, data) => {
                if (err) {
                    if (lib.isEmptyObject(err)) {
                        next(lib.error(404, `user details not found for ${req.params.username}`));
                    } else {
                        next(lib.error(500, `internal server error ${err}`));
                    }
                } else {
                    res.status(200).json({ success: "User record updated succesfully" });
                }
            })
        }).catch(error => {
            next(lib.error(401, `${error.error}`));
        })
    } catch (err) {
        next(lib.error(500, `internal server error ${err}`));
    }
}
exports.addUser = (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            next(lib.error(422, errors.array()));
            return;
        }
        var password = req.body.password
        var encryptedPassword = bcrypt.hashSync(password, 10, function (err, hash) {
            if (err) {
                return ({ error: "secretkey encrypytion failed" })
            }
        });
        userModel.insert({ UserName: req.body.username, Password: encryptedPassword, GroupId: req.body.groupid }, (err, data) => {
            if (err) {
                next(lib.error(500, `internal server error ${err}`));
            } else {
                res.status(201).json({ success: "User record inserted succesfully" });
            }
        })
    } catch (err) {
        next(lib.error(500, `internal server error ${err}`));
    }
}
exports.getAllUsers = (req, res, next) => {
    userModel.setConfig(config.database)
    userModel.find({}, function (err, data) {
        if (err) {
            if (lib.isEmptyObject(err)) {
                res.status(404).json({ error: "no data found" });
            } else {
                next(lib.error(500, `internal server error ${err}`));
            }
        } else {
            res.status(200).json(data);
        }
    })
}
function checkSecretKey(reqseckey, dbseckey) {
    return bcrypt.compareSync(reqseckey, dbseckey)
}
