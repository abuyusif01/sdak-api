const { User, Door, Permission } = require("../../models");
var bcrypt = require("bcryptjs");


/**
 * 
 * @param {*} req 
 * @param {*} res 
 * 
 * function to get all doors in the database
 */
exports.getAllDoors = (req, res) => {
    Door.findAll().then(doors => {
        res.send(doors);
    });
}

/**
 * add a new door to the list of doors in the database
 * Only admins can add doors. return the newly created doorId
 * 
 * params: doorId, doorLocation
*/
exports.addDoor = (req, res) => {

    // check if door already exists
    Door.findOne({
        where: { doorLocation: req.body.doorLocation }
    }).then(door => {
        if (door) {
            return res.status(400).send({
                message: "Door already exists!",
                doorId: door.doorId
            });
        }
        else {
            // create a new door
            Door.create({ doorLocation: req.body.doorLocation }).then((door) => {
                res.send({
                    message: "Door added successfully!",
                    doorId: door.doorId
                });
            });
        }
    });
}

/**
 * remove a door from the list of doors in the database
 * Only admins can remove doors
 * 
 * params: doorId
 * 
 * this will remove all permissions associated with this door
 */
exports.removeDoor = (req, res) => {

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
}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * 
 * params: userId, doorId
 * 
 * give user a permission to access a door
 */
exports.giveAccess = (req, res) => {

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
}


/**
 * 
 * @param {*} req 
 * @param {*} res 
 * 
 * params: userId, doorId
 * 
 * revoke users access to a door
 */
exports.revokeAccess = (req, res) => {

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
}

/**
 * 
 * @param {*} req 
 * @param {*} res
 * 
 * params: userId, role 
 */
exports.updateRole = (req, res) => {

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
}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * 
 * params: userId
 * 
 * return all doors that a user has access to (only admin can access this route)
 */
exports.getAllUserDoorsWithAccess = (req, res) => {

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
 * 
 * params: userId, emial, password, role
 * 
 * update any user info (only admin can access this route)
 */
exports.updateInfo = (req, res) => {

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
 *
 * @returns void 
 * 
 * testing admin board route
 */
exports.adminBoard = (req, res) => {
    // Todo: implement admin board
    res.status(200).send("admin route working");
};