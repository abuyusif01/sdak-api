const { User, Door, Permission, Passcode } = require("../../models");
var bcrypt = require("bcryptjs");
const { validateAlphanumeric } = require("./utils/validator");



/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @description
 * API Controller to retrieve all doors in the database
 * 
 * function to get all doors in the database
 */
exports.getAllDoors = (req, res) => {
    Door.findAll().then(doors => {
        res.send({ doors: doors });
    });
};

/**
 * @param {*} req 
 * @param {*} res 
 * @description
 * API Controller to add a new door in the database
 * Only admins can add doors. return the newly created doorId
 * 
 * params: doorId, doorLocation, doorName
*/
exports.addDoor = (req, res) => {

    /**
     * User input validation
     */
    if (!validateAlphanumeric(req.body.doorId.toString(), req.body.doorLocation.toString(), req.body.doorName.toString())) {
        return res.status(400).send({ message: "Invalid user input" })
    }

    // check if door already exists
    Door.findOne({
        where: { doorName: req.body.doorName }
    }).then(door => {
        if (door) {
            return res.status(400).send({
                message: "Door already exists!",
                doorId: door.doorId
            });
        }
        else {
            // create a new door
            Door.create({ doorName: req.body.doorName, doorLocation: req.body.doorLocation }).then((door) => {
                res.send({
                    message: "Door added successfully!",
                    doorId: door.doorId,
                    doorName: door.doorName,
                    doorLocation: door.doorLocation
                });
            });
        }
    });
};

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @description
 * remove a door from the list of doors in the database
 * Only admins can remove doors. this will also remove all permissions associated with this door
 * 
 * params: doorId
 */
exports.removeDoor = (req, res) => {

    /**
     * This act like a middleware, we make sure the input is sanitize to avoid SQLi
     */
    if (!validateAlphanumeric(req.body.doorId.toString())) {
        return res.status(400).send({ message: "Invalid user input" })
    }

    Door.findOne({
        where: { doorId: req.body.doorId }
    }).then(door => {
        if (!door) {
            return res.status(404).send({
                message: "Door Not found.",
                doorId: req.body.doorId
            });
        }
        else {
            // drop all permission associated with this door
            Permission.destroy({
                where: { doorId: door.doorId }
            });
            door.destroy().then((door) => {
                res.send({
                    message: "Door removed successfully!",
                    doorId: req.body.doorId
                });
            });
        }
    });
};

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @description API Controller to give user a permission to access a door
 * 
 * params: userId, doorId
 * 
 */
exports.giveAccess = (req, res) => {

    if (!validateAlphanumeric(req.body.doorId.toString(), req.body.userId.toString())) {
        return res.status(400).send({ message: "Invalid user input" })
    }

    // check if the permission already exists
    Permission.findOne({
        where: { userId: req.body.userId, doorId: req.body.doorId }
    }).then(permission => {
        if (permission) {
            return res.status(400).send({
                message: "Permission already exists!",
                userId: req.body.userId,
                doorId: req.body.doorId
            });
        }
        else {
            User.findOne({
                where: { userId: req.body.userId }
            }).then(user => {
                if (!user) {
                    return res.status(404).send({
                        message: "User Not found.",
                        userId: req.body.userId
                    });
                }
                Door.findOne({
                    where: { doorId: req.body.doorId }
                }).then(door => {
                    if (!door) {
                        return res.status(404).send({
                            message: "Door Not found.",
                            doorId: req.body.doorId
                        });
                    }
                    Permission.create({
                        userId: user.userId,
                        doorId: door.doorId
                    }).then((permission) => {
                        res.send({
                            message: "Access given successfully!",
                            userId: user.userId,
                            doorId: door.doorId,
                            permissionId: permission.permissionId
                        });
                    });
                });
            });
        }
    });
};


/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @description API controller revoke users access to a door
 * 
 * params: userId, doorId
 * 
 */
exports.revokeAccess = (req, res) => {

    /**
     * Validate user input
     * forcing a toString method will insure everything will be treated as a string
     */
    if (!validateAlphanumeric(req.body.doorId.toString(), req.body.userId.toString())) {
        return res.status(400).send({ message: "Invalid user input" })
    }

    User.findOne({
        where: { userId: req.body.userId }
    }).then(user => {
        if (!user) {
            return res.status(404).send({
                message: "User Not found.",
                userId: req.body.userId
            });
        }
        Door.findOne({
            where: { doorId: req.body.doorId }
        }).then(door => {
            if (!door) {
                return res.status(404).send({
                    message: "Door Not found.",
                    doorId: req.body.doorId
                });
            }
            Permission.findOne({
                where: { userId: user.userId, doorId: door.doorId }
            }).then(permission => {
                if (!permission) {
                    return res.status(404).send({ message: "Permission Not found." });
                }
                else {
                    permission.destroy().then(() => {
                        res.send({
                            message: "Access revoked successfully!",
                            userId: user.userId,
                            doorId: door.doorId,
                            permissionId: permission.permissionId
                        });
                    });
                }
            });
        });
    });
};

/**
 * 
 * @param {*} req 
 * @param {*} res
 * @description API Controller for admin to update any user's role
 * 
 * params: userId, role 
 */
exports.updateRole = (req, res) => {

    /**
     * User input validation
     */
    if (!validateAlphanumeric(req.body.doorId.toString(), req.body.role.toString())) {
        return res.status(400).send({ message: "Invalid user input" })
    }

    const ROLES = ["user", "admin", "mod"];

    if (!req.body.role && !req.body.userId) {
        return res.status(400).send({
            message: "Role or userId can not be empty!"
        });
    }

    if (!ROLES.includes(req.body.role)) {
        return res.status(400).send({
            message: "Role can only be user, admin or mod"
        });
    }

    User.findOne({
        where: { userId: req.body.userId }
    }).then(user => {
        if (!user) {
            return res.status(404).send({
                message: "User Not found.",
                userId: req.body.userId
            });
        }
        else {
            user.update({
                role: req.body.role
            }).then(() => {
                res.send({
                    message: "User role updated successfully!",
                    userId: user.userId,
                    role: req.body.role
                });
            });
        }
    });
};

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @description API Controller to return all doors that a user has access to (only admin can access this route)
 * 
 * params: userId
 */
exports.getAllUserDoorsWithAccess = (req, res) => {

    /**
     * User validation
     */
    if (!validateAlphanumeric(req.body.userId.toString())) {
        return res.status(400).send({ message: "Invalid user input" })
    }

    Permission.findAll({
        where: { userId: req.body.userId },
        include: [
            {
                model: Door,
                as: "door",
                attributes: ["doorId", "doorLocation"]
            }
        ]
    }).then((permissions) => {
        res.send(permissions);
    });
};

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @description API Controller to update any user info (only admin can access this route)
 * 
 * params: userId, emial, password, role
 */
exports.updateInfo = (req, res) => {

    /**
     * User validation
     */
    if (!validateAlphanumeric(req.body.userId.toString(), req.body.email.toString(), req.body.password.toString(), req.body.role.toString())) {
        return res.status(400).send({ message: "Invalid user input" })
    }

    User.findOne({
        where: { userId: req.body.userId }
    }).then(user => {
        if (!user) {
            return res.status(404).send({
                message: "User Not found.",
                userId: req.body.userId
            });
        }
        else {
            user.update({
                email: req.body.email,
                password: bcrypt.hashSync(req.body.password, 8),
                role: req.body.role || 'user'
            }).then(() => {
                res.send({
                    message: "User info updated successfully!",
                    userId: user.userId,
                    email: req.body.email,
                    password: req.body.password,
                    role: req.body.role

                });
            });
        }
    });
};

/**
 * 
 * @param {*} req
 * @param {*} res
 * @description API Controller to add a passcode to a door (only admin can access this route)
 * 
 * params: doorId, doorPasscode
 * TODO: take start/end Time and Date from the admin
 * 
 * @returns doorId, doorPasscode
 * 
 */
exports.addDoorPasscode = (req, res) => {

    /**
     * User validation
     */
    if (!validateAlphanumeric(req.body.doorId.toString(), req.body.doorPasscode.toString())) {
        return res.status(400).send({ message: "Invalid user input" })
    }

    Door.findOne({
        where: { doorId: req.body.doorId }
    }).then(door => {
        if (!door) {
            return res.status(404).send({
                message: "Door Not found.",
                doorId: req.body.doorId
            });
        }

        Passcode.findOne({
            where: { doorId: door.doorId }
        }).then(passcode => {
            if (passcode) {
                return res.status(400).send({
                    message: "Door already have a passcode.",
                    doorId: door.doorId,
                    doorPasscode: passcode.doorPasscode
                });
            }
            Passcode.create({
                doorPasscode: req.body.doorPasscode,
                doorId: door.doorId
            }).then(() => {
                res.send({
                    message: "Passcode added successfully!",
                    doorId: door.doorId,
                    doorPasscode: req.body.passcode
                });
            });
        });
    });
};

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns doorId, doorPasscode
 * 
 * @description API Controller to revoke a door's passcode (only admin can access this route)
 * 
 */
exports.revokeDoorPasscode = (req, res) => {

    /**
     * User validation
     */
    if (!validateAlphanumeric(req.body.doorId.toString())) {
        return res.status(400).send({ message: "Invalid user input" })
    }

    Door.findOne({
        where: { doorId: req.body.doorId }
    }).then(door => {
        if (!door) {
            return res.status(404).send({
                message: "Door Not found.",
                doorId: req.body.doorId
            });
        }

        Passcode.findOne({
            where: { doorId: door.doorId }
        }).then(passcode => {
            if (!passcode) {
                return res.status(400).send({
                    message: "Door doesn't have a passcode.",
                    doorId: door.doorId
                });
            }
            passcode.destroy().then(() => {
                res.send({
                    message: "Passcode revoked successfully!",
                    doorId: door.doorId
                });
            });
        });
    });
}



/**
 * 
 * @param {*} req 
 * @param {*} res 
 *
 * @returns void 
 * 
 * testing admin board route
 */
exports.adminBoard = (req, res) => {
    // Todo: implement admin board
    res.status(200).send("admin route working");
};