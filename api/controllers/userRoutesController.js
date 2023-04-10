const { port, host, rejectUnauthorized } = require('./config/config.json');
const { User, Door, Permission } = require("../../models");
const mqtt = require('mqtt');
var bcrypt = require("bcryptjs");

const options = {
    port: port,
    host: host,
    rejectUnauthorized: rejectUnauthorized,
}

// hivemq controller set up 
const client = mqtt.connect('mqtts://', options);


/**
 * 
 * @param {*} req 
 * @param {*} res 
 * 
 * route to open a door
 * 
 * params: doorId, UserId
 */
exports.openDoor = (req, res) => {

    if (req.userId !== req.body.userId) {
        return res.status(403).send({
            message: "Invalid user",
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
                    return res.status(404).send({
                        message: "Permission Not found.",
                        userId: user.userId,
                        doorId: door.doorId
                    });
                }
                // client.publish('kulliyah/level/room/device1/command', 'open');
                res.send({ message: "Door is opening" });
            });
        });
    });
}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * 
 * route to close a door
 * 
 * params: doorId, UserId
 */
exports.closeDoor = (req, res) => {

    if (req.userId !== req.body.userId) {
        return res.status(403).send({
            message: "Invalid user",
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
                    return res.status(404).send({
                        message: "Permission Not found.",
                        userId: user.userId,
                        doorId: door.doorId
                    });
                }
                // client.publish('kulliyah/level/room/device1/command', 'open');
                res.send({ message: "Door is Closing" });
            });
        });
    });
}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns promise
 * 
 * update userinfo 
 * params: userId, email, password, role
 */
exports.updateUserInfo = (req, res) => {

    if (req.userId !== req.body.userId) {
        return res.status(403).send({
            message: "Invalid user",
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
}


exports.getAllDoorsWithAccess = (req, res) => {

    if (req.userId !== req.body.userId) {
        return res.status(403).send({
            message: "Invalid user",
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
            res.send(permissions);
        });
    });
}

exports.userBoard = (req, res) => {
    
    res.status(200).send("User Content.");
}