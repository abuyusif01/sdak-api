const { verifySignUp } = require("../middleware");
const controller = require("../controllers/authRoutesController");

module.exports = function (app) {
    app.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    // register route
    app.post("/api/register", [verifySignUp.checkDuplicateUsernameOrEmail, verifySignUp.checkRolesExisted], controller.signup);

    //login route
    app.post("/api/login", controller.signin);
};
