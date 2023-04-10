const { User } = require("../../models");

const checkDuplicateEmail = (req, res, next) => {
    User.findOne({
        where: {
            email: req.body.email
        }
    }).then(user => {
        if (user) {
            res.status(400).send({
                message: "Failed! Email is already in use!"
            });
            return;
        }
        next();
    });
};

const checkRolesExisted = (req, res, next) => {
    const ROLES = ["user", "admin", "mod"];
    if (req.body.role) {
        if (!ROLES.includes(req.body.role.toString())) {
            res.status(400).send({
                message: "Failed! Role does not exist = " + req.body.role
            });
            return;
        }
    }
    next();
};

const verifySignUp = {
    checkDuplicateUsernameOrEmail: checkDuplicateEmail,
    checkRolesExisted: checkRolesExisted
};

module.exports = verifySignUp;
