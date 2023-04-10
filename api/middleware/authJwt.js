const jwt = require("jsonwebtoken");
const config = require("../config/authConfig");
const { User } = require("../../models");

verifyToken = (req, res, next) => {
    let token = req.headers["x-access-token"];

    if (!token) {
        return res.status(403).send({
            message: "No token provided!"
        });
    }

    jwt.verify(token, config.secret, (err, decoded) => {

        if (err) {
            return res.status(401).send({
                message: "Unauthorized!"
            });
        }
        req.userId = decoded.id;
        next();
    });
};


isAdmin = (req, res, next) => {
    User.findOne({
        where: { userId: req.userId },
        attributes: ['role']
    }).then(user => {
        try {
            if (user.role === "admin") {
                next();
                return;
            }
            else {
                res.status(403).send({
                    message: "Require Admin Role!"
                });
                return;
            }
        } catch (error) {
            res.status(500).send({
                message: "server error"
            });
            return;
        }
    });
};


isModerator = (req, res, next) => {
    User.findOne({
        where: { userId: req.userId },
        attributes: ['role']
    }).then(user => {
        try {
            if (user.role === "mod") {
                next();
                return;
            }
            else {
                res.status(403).send({
                    message: "Require Moderator Role!"
                });
                return;
            }
        } catch (error) {
            res.status(500).send({
                message: "server error"
            });
            return;
        }
    });
};

const authJwt = {
    verifyToken: verifyToken, // if is true you're user and you can access the routes
    isAdmin: isAdmin,
    isModerator: isModerator,
};
module.exports = authJwt;
