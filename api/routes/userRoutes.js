const { authJwt } = require("../middleware");
const controller = require("../controllers/userRoutesController");

module.exports = function (app) {
    app.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.get(
        "/api/test/user",
        [authJwt.verifyToken],
        controller.userBoard
    );
    
    // open door
    app.post("/api/openDoor", [authJwt.verifyToken], controller.openDoor);

    // close door
    app.post("/api/closeDoor", [authJwt.verifyToken], controller.closeDoor);

    // change user info
    app.post("/api/updateUserInfo", [authJwt.verifyToken], controller.updateUserInfo);

    // get all doors with access
    app.get("/api/getAllDoorsWithAccess", [authJwt.verifyToken], controller.getAllDoorsWithAccess);
};
