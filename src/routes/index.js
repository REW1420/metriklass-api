const { Router } = require("express");
const router = Router();
const projectController = require("../controllers/ProjectController");
const userController = require("../controllers/UserController");
const dashboardController = require("../controllers/DashboardController");
const userAdminController = require("../controllers/UserAdminController");
const authController = require("../controllers/MyAuthController");
const logController = require("../controllers/LogController");
const jwtUtils = require("../JWT");

//generate jwt from and endpoint
const secret = "secret";
router.get("/get-jwt/:userId/:name", (req, res) => {
  const userId = req.params.userId;
  const name = req.params.name;
  //create payload for token
  const payload = { userId, name };
  const token = jwtUtils.generateJWT(payload);
  res.json({ token: token });
});

router.get("/validate-jwt", async (req, res) => {
  const token = req.query.token;

  if (!token) return res.status(400).json({ message: "No token provided" });

  try {
    const isValid = await jwtUtils.validateJWT(token);

    if (isValid) {
      return res.json({ message: "Valid token" });
    } else {
      return res.status(401).json({ message: "Invalid token" });
    }
  } catch (error) {
    console.error("Error en la validación del token:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

//project routes
router.post("/project-post", projectController.add);
//projects global info
router.get("/project/info", projectController.projectGlobalInfo);
//get all projects where im in
router.get("/projects/in/:teamValue/", projectController.getProjectsByTeam);
//get all projects where im not it
router.get("/projects/out/:teamValue", projectController.getProjectNo);
//get all projects i onw
router.get("/projects/own/:owner", projectController.getProjectsByOwner);
//get close project by team
router.get("/projects/close/:teamValue", projectController.getCloseProject);
//get kpi data from project by id
router.get("/projects/kpi/:user_id", projectController.getProjectKPIByID);
//get single project info
router.get(
  "/projects/info/:projectId/:userId",
  projectController.getprojectInfo
);
//delete team member
router.delete(
  "/projects/delete-member/:projectId/:memberId",
  projectController.deleteTeamMember
);

//delete project from id
router.delete("/projects/delete/:id", projectController.deleteProject);
//update mision status
router.put(
  "/projects/update-status/:projectId/:misionId",
  projectController.updateMisionStatus
);
router.put(
  "/projects/update-finished/:projectId/:misionId",
  projectController.updateMisionFinished
);
router.put(
  "/projects/update-close/:projectId",
  projectController.updateCloseProject
);
router.put("/projects/update/:projectId", projectController.updateProject);
//update team
router.post("/projects/update-team/:projectId", projectController.updateTeam);
//add mision
router.post("/projects/add-mision/:projectId", projectController.addNewMision);
//delete single mision
router.delete(
  "/projects/delete-mision/:projectId/:misionId/:userId",
  projectController.DeleteSingleMision
);
//test
router.get("/test", projectController.getAllProjectProgress);

//ALL ROUTER FOR USER HERE
router.get("/user/test", userController.test);
router.post("/user/post", userController.createUser);

router.put("/user/update/:id", userController.updateUser);
router.get("/user/addCount/:user_id", userController.addMissionCompletedCount);
router.get("/user/get/:id", userController.getUserInfo);
router.post("/user/login", userController.getLogin);
router.put("/user/update-docs/:userId", userController.updatePersonalDocs);
router.put("/user/update-pass/:userId", userController.updatePassword);
router.delete("/user/delete/:id", userController.DeleteUserByID);
//all dashboard routes here
router.get("/kpi/test", dashboardController.test);
router.get("/kpi/post/:id", dashboardController.createObject);
router.get("/kpi/get/:id", dashboardController.getObject);

//forgot password route
router.post("/auth/reset", authController.findEmail);

router.get(
  "/auth/reset-password/:id/:token",
  authController.sendEmailWithOneTimeLink
);
router.post("/auth/reset-password/:id/:token", authController.changePassword);

//ALL ROUTES FOR ADMIN USER HERE

router.get("/admin", userAdminController.getAllAdminUser);
router.get("/admin/status/:user_id", userAdminController.getActiveStatus);
router.put("/admin/update/:user_id", userAdminController.updateInfo);
router.post("/admin", userAdminController.createAdminUser);
router.post("/admin/login", userAdminController.getAdminLogin);
router.put(
  "/admin/update-user-pass/:user_id",
  userController.updatePasswordWithOutConfirmation
);
router.put("/admin/:user_id", userAdminController.updateAdminUserActive);
router.put(
  "/admin/update-admin-pass/:user_id",
  userAdminController.updaterAdminPassword
);
router.delete(
  "/admin/delete/:user_id",
  userAdminController.deleteAdminUserByID
);

///ALL LOG ROUTES HERE
router.post("/log", logController.createLog);

router.get("/log", logController.getAllLogs);
module.exports = router;
