const { User } = require("../../models");
const config = require("../config/authConfig");
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");


/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns void
 * 
 * route to register a user
 */
exports.signup = (req, res) => {
    const ROLES = ["user", "admin", "mod"];

    if (req.body.role) {
        if (!ROLES.includes(req.body.role.toString())) {
            res.status(400).send({
                message: "Failed! Role does not exist = " + req.body.role
            });
            return;
        }
        else {
            User.create({
                email: req.body.email,
                password: bcrypt.hashSync(req.body.password, 8),
                role: req.body.role
            }).then(() => {
                res.send({ message: "User registered successfully!" });
            });
        }
    } else {
        res.status(400).send({ message: "No role provided" });
    }
};


/**
 * 
 * @param {*} req 
 * @param {*} res
 * @returns void
 * 
 * route to login a user
 */
exports.signin = (req, res) => {
    User.findOne({
        where: {
            email: req.body.email
        }
    }).then(user => {
        if (!user) {
            return res.status(404).send({ message: "User Not found." });
        }

        var passwordIsValid = bcrypt.compareSync(
            req.body.password,
            user.password
        );

        if (!passwordIsValid) {
            return res.status(401).send({
                token: null,
                message: "Invalid Password!"
            });
        }

        var token = jwt.sign({ id: user.userId }, config.secret, {
            expiresIn: 86400 // 24 hours
        });

        res.status(200).send({
            id: user.userId,
            role: user.role,
            email: user.email,
            token: token
        });
    }).catch(err => {
        res.status(500).send({ message: err.message });
    });
};
