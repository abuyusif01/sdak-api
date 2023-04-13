const jwt = require("jsonwebtoken");
const config = require("../config/authConfig");
const { User } = require("../../models");

/**
 * @params (req, res, next)
 * 
 * validate user token, if the token is valid, then proceed to next middleware
 * 
 */
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

/**
 * @params (req, res, next)
 * 
 * check if the current user role is admin,
 * we dont check what the user pass, if we do so the user can easily abuse jwt and change the role themselves
 * so we gonnna be checking the actual user role in the database
 */
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


/**
 * @params (req, res, nexxt)
 * 
 * check if the give token have mod role
 */
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
