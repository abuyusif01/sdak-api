const { User } = require("../../models");
const { validateAlphanumeric } = require("../controllers/utils/validator");

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * 
 * Helper function to check if the email already registered in the database
 */
const checkDuplicateEmail = (req, res, next) => {

    /**
     * we try the best we can to sanitize user input
     */
    if (!validateAlphanumeric(req.body.email.toString())) {
        return res.status(400).send({ message: "Invalid user input", })
    }

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

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns void
 * 
 * Helper function to check if the role is valid role, this function is used upon registration.
 */
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
