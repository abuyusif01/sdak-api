const { authJwt } = require("../middleware");
const controller = require("../controllers/adminRoutesController");

module.exports = function (app) {
    app.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    // test admin route
    app.get("/api/test/admin", [authJwt.verifyToken, authJwt.isAdmin], controller.adminBoard);

    // get all doors
    app.get("/api/getAllDoors", [authJwt.verifyToken, authJwt.isAdmin], controller.getAllDoors);

    // add door
    app.post("/api/addDoor", [authJwt.verifyToken, authJwt.isAdmin], controller.addDoor);

    // remove door
    app.post("/api/removeDoor", [authJwt.verifyToken, authJwt.isAdmin], controller.removeDoor);

    // give access 
    app.post("/api/giveAccess", [authJwt.verifyToken, authJwt.isAdmin], controller.giveAccess);

    // revoke access
    app.post("/api/revokeAccess", [authJwt.verifyToken, authJwt.isAdmin], controller.revokeAccess);

    // update role
    app.post("/api/updateRole", [authJwt.verifyToken, authJwt.isAdmin], controller.updateRole);

    // update info
    app.post("/api/updateInfo", [authJwt.verifyToken, authJwt.isAdmin], controller.updateInfo);

    // get all doors with access
    app.get("/api/getAllUserDoorsWithAccess", [authJwt.verifyToken, authJwt.isAdmin], controller.getAllUserDoorsWithAccess);

    //add doorPasscode
    app.post("/api/addDoorPasscode", [authJwt.verifyToken, authJwt.isAdmin], controller.addDoorPasscode);

    // remove doorPasscode
    app.post("/api/revokeDoorPasscode", [authJwt.verifyToken, authJwt.isAdmin], controller.revokeDoorPasscode);

    // get door pin codes
    app.get("/api/getDoorPin", [authJwt.verifyToken, authJwt.isAdmin], controller.getDoorPin);

}
