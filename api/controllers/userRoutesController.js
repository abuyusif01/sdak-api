const { port, host, rejectUnauthorized } = require('./config/config.json');
const { validateAlphanumeric } = require('./utils/validator')
const { User, Door, Permission } = require("../../models");
const mqtt = require('mqtt');
var bcrypt = require("bcryptjs");

const options = {
    port: port,
    host: host,
    rejectUnauthorized: rejectUnauthorized,
};

// hivemq controller set up 
const client = mqtt.connect('mqtts://', options);


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
     * rule 1. never trust the user
     * we sanitize the input first
     */
    if (!validateAlphanumeric(req.body.userId.toString(), req.body.doorId.toString())) {
        return res.status(400).send({ message: "Invalid user or door ID", })
    }

    /**
     * First of all we check the userId is actually the authenticated userId
     * Incase the user try to act smart, we tackle this
     * 
    */
    User.findOne({ where: { userId: req.userId } }).then((user) => {
        if (user.role !== "admin") {
            if (req.userId.toString() !== req.body.userId) {
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
                            res.send({ message: "Door is opening" });
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
                            res.send({ message: "Door is opening" });
                        }
                    });
                });
            });
        });
    })
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

    if (!validateAlphanumeric(req.body.userId.toString(), req.body.doorId.toString())) {
        return res.status(400).send({ message: "Invalid user or door ID", })
    }

    /**
     * First of all we check the userId is actually the authenticated userId
     * Incase the user try to act smart, we tackle this
     * 
    */
    User.findOne({ where: { userId: req.userId } }).then((user) => {
        if (user.role !== "admin") {
            if (req.userId.toString() !== req.body.userId) {
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
                            res.send({ message: "Door is closing" });
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
                            res.send({ message: "Door is closing" });
                        }
                    });
                });
            });
        });
    })
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

    if (!validateAlphanumeric(req.body.email.toString(), req.body.password.toString(), req.body.userId.toString())) {
        return res.status(400).send({ message: "Invalid userId, email or password", })
    }

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
};


/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @description API controller to get all doors the current user have access to
 * 
 * params: userId
 */
exports.getAllDoorsWithAccess = (req, res) => {

    if (!validateAlphanumeric(req.body.userId.toString())) {
        return res.status(400).send({ message: "Invalid user ID", })
    }

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
};

exports.userBoard = (req, res) => {

    res.status(200).send("User Content.");
};