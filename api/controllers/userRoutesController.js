const fs = require('fs');
const { port, host, rejectUnauthorized, username, password } = require('./config/config.json');
const { validateAlphanumeric } = require('./utils/validator')
const { User, Door, Permission, Passcode } = require("../../models");
const mqtt = require('mqtt');
var bcrypt = require("bcryptjs");


const caFile = fs.readFileSync(__dirname + '/cert/ca.crt');
const options = {
    ca: caFile,
    rejectUnauthorized: rejectUnauthorized, // make sure the cert is valid
    username: username,
    password: password,
    port: port,
    host: host,
    protocol: 'mqtts',

};

// mosquitto controller set up 
const client = mqtt.connect(options);

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @description API Controller to open door, we make the user have access
 * to the door they trying to open. {this function will call hiveMQ to open the door}
 * 
 * params: doorId, UserId
 */
exports.openDoor = (req, res) => {

    /**
     * we sanitize the input first
     */
    if (!validateAlphanumeric(req.body.userId?.toString(), req.body.doorId?.toString())) {
        return res.status(400).send({ message: "Invalid user or door ID", })
    }

    /**
     * First of all we check the userId is actually the authenticated userId
     * Incase the user try to act smart, we tackle this
     * 
    */
    User.findOne({ where: { userId: req.userId } }).then((user) => {
        if (user.role !== "admin") {
            if (req.userId?.toString() !== req.body.userId?.toString()) {
                return res.status(403).send({
                    message: "Only admin can do this!",
                    userId: user.userId,
                    role: user.role
                });
            }
        }

        /**
         * We check if the user actually exist, it might not make sense checkking the user up there
         * but if we let it unchecked the user can easily abuse jwt and change their role manually
         * we proceed with checking if the door actually exist, then permission
         * for the permission, if the user turns out to be admin, 
         * we can just open the door even if they dont have permission
         * another important point to remember here is: the admin can open/close door as anyone
         * 
         */
        User.findOne({
            where: { userId: req.body.userId }
        }).then(user => {
            if (!user) { return res.status(404).send({ message: "User Not found.", userId: req.body.userId }); }

            Door.findOne({
                where: { doorId: req.body.doorId }
            }).then(door => {
                if (!door) { return res.status(404).send({ message: "Door Not found.", doorId: req.body.doorId }); }

                Permission.findOne({
                    where: { userId: user.userId, doorId: door.doorId }
                }).then(permission => {
                    User.findOne({ where: { userId: req.userId } }).then((user) => {
                        if (user.role === "admin") {
                            // res.send({ message: "Door is opening" });
                            res.send({ message: "Door is opening id: " + door.doorId });
                            client.publish(`door/${door.doorId}`, 'open');
                        }
                        else {
                            if (!permission) {
                                return res.status(404).send({
                                    message: "Permission Not found.",
                                    userId: user.userId,
                                    doorId: door.doorId,
                                    role: user.role
                                });
                            }
                            res.send({ message: "Door is opening id: " + door.doorId });

                            client.publish(`door/${door.doorId}`, 'open');
                        }
                    });
                });
            });
        });
    });
};

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @description API Controller to close door, we make the user have access
 * to the door they trying to close. {this function will call hiveMQ to close the door}
 * 
 * params: doorId, UserId
 */
exports.closeDoor = (req, res) => {

    if (!validateAlphanumeric(req.body.userId?.toString(), req.body.doorId?.toString())) {
        return res.status(400).send({ message: "Invalid user or door ID", })
    }

    /**
     * First of all we check the userId is actually the authenticated userId
     * Incase the user try to act smart, we tackle this
     * 
    */
    User.findOne({ where: { userId: req.userId } }).then((user) => {
        if (user.role !== "admin") {
            if (req.userId?.toString() !== req.body.userId?.toString()) {
                return res.status(403).send({
                    message: "Only admin can do this!",
                    userId: user.userId,
                    role: user.role
                });
            }
        }

        /**
         * We check if the user actually exist, it might not make sense checkking the user up there
         * but if we let it unchecked the user can easily abuse jwt and change their role manually
         * we proceed with checking if the door actually exist, then permission
         * for the permission, if the user turns out to be admin, 
         * we can just open the door even if they dont have permission
         * another important point to remember here is: the admin can open/close door as anyone
         * 
         */
        User.findOne({
            where: { userId: req.body.userId }
        }).then(user => {
            if (!user) { return res.status(404).send({ message: "User Not found.", userId: req.body.userId }); }

            Door.findOne({
                where: { doorId: req.body.doorId }
            }).then(door => {
                if (!door) { return res.status(404).send({ message: "Door Not found.", doorId: req.body.doorId }); }

                Permission.findOne({
                    where: { userId: user.userId, doorId: door.doorId }
                }).then(permission => {
                    User.findOne({ where: { userId: req.userId } }).then((user) => {
                        if (user.role === "admin") {
                            res.send({ message: "Door is closing id: " + door.doorId });
                            client.publish(`door/${door.doorId}`, 'close');
                        }
                        else {
                            if (!permission) {
                                return res.status(404).send({
                                    message: "Permission Not found.",
                                    userId: user.userId,
                                    doorId: door.doorId,
                                    role: user.role
                                });
                            }
                            res.send({ message: "Door is closing id: " + door.doorId });
                            client.publish(`door/${door.doorId}`, 'close');
                        }
                    });
                });
            });
        });
    });
};

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @description API controller to update user info
 * 
 * params: userId, email, password, role
 */
exports.updateUserInfo = (req, res) => {

    if (!validateAlphanumeric(req.body.email?.toString(), req.body.password?.toString(), req.body.userId?.toString())) {
        return res.status(400).send({
            message: "Invalid userId, email or password",
            userId: req.body.userId,
            email: req.body.email,
            password: req.body.password
        })
    }

    if (req.userId.toString() !== req.body.userId.toString()) {
        return res.status(403).send({
            message: "Invalid user input"

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
        user.update({
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, 8),
        }).then(() => {
            res.send({
                message: "User info updated successfully!",
                userId: user.userId,
                email: user.email,
                role: user.role,
                password: req.body.password
            });
        });
    });
};

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @params userId
 * 
 * @description API controller to get all doors the current user have access to
 * 
 */
exports.getAllDoorsWithAccess = (req, res) => {

    if (!validateAlphanumeric(req.body.userId?.toString())) {
        return res.status(400).send({ message: "Invalid user input.", })
    }

    if (req.userId.toString() !== req.body.userId.toString()) {
        return res.status(403).send({
            message: "Invalid user.",
            userId: req.body.userId
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

        Permission.findAll({
            where: { userId: user.userId },
            include: [{
                model: Door,
                as: "door",
                attributes: ["doorId", "doorLocation"]
            }]
        }).then(permissions => {
            if (!permissions) {
                return res.status(404).send({
                    message: "Permission Not found.",
                    userId: user.userId
                });
            }
            res.send({ doors: permissions });
        });
    });
};

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns doorId
 * 
 * @description API controller to add door to the permission table for the user by providing valid passcode
 * first we check if the user exist, then we check if the door exist, then we check if the passcode is valid
 * if all are true, we add the door to the permission table
 * refactor this function now we dont need doorId, we gonna extract it from the passcode table
 * since each passcode have a doorId
 */
exports.addDoorWithPasscode = (req, res) => {

    if (!validateAlphanumeric(req.body.userId?.toString(), req.body.doorPasscode?.toString())) {
        return res.status(400).send({ message: "Invalid user input.", })
    }

    if (req.userId?.toString() !== req.body.userId?.toString()) {
        return res.status(403).send({
            message: "Invalid user.",
            userId: req.body.userId
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

        Passcode.findOne({
            where: {
                doorPasscode: req.body.doorPasscode
            }
        }).then(passcode => {
            if (!passcode) {
                return res.status(404).send({ message: "Passcode Not valid." });
            }

            Permission.findOne({
                where: { userId: user.userId, doorId: passcode.doorId }
            }).then(permission => {
                if (permission) {
                    return res.status(404).send({
                        message: "Permission already exist.",
                        userId: user.userId,
                    });
                }
                Permission.create({
                    userId: user.userId,
                    doorId: passcode.doorId,
                    passcodeId: passcode.passcodeId
                }).then(() => {
                    res.send({
                        message: "Door added successfully!",
                        userId: user.userId,
                        doorId: passcode.doorId
                    });
                });
            });
        });
    });
};

exports.userBoard = (req, res) => {

    res.status(200).send("User Content.");
};