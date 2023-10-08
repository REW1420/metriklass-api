const { Router } = require("express");
const router = Router();
const orderControlloer = require("../controllers/OrderController");
const projectController = require("../controllers/ProjectController");
const userController = require("../controllers/UserController");
const jwtUtils = require("../JWT");

router.get("/", (req, res) => {
  const data = {
    id: "1",
    name: "API is working",
  };
  res.json(data);
});

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
//order routes
router.get("/order-list", orderControlloer.list);
router.post("/order-post", orderControlloer.add);

//project routes
router.post("/project-post", projectController.add);

//get all projects where im in
router.get("/projects/in/:teamValue/", projectController.getProjectsByTeam);
//get all projects where im not it
router.get("/projects/out/:teamValue", projectController.getProjectNo);
//get all projects i onw
router.get("/projects/own/:owner", projectController.getProjectsByOwner);
//get close project by team
router.get("/projects/close/:teamValue", projectController.getCloseProject);
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
//test
router.get("/test", projectController.getAllProjectProgress);

//ALL ROUTER FOR USER HERE
router.get("/user/test", userController.test);
router.post("/user/post", userController.createUser);
router.put("/user/update/:id", userController.updateUser);
router.get("/user/get/:id", userController.getUserInfo);
router.post("/user/login", userController.getLogin);
router.put("/user/update-docs/:userId", userController.updatePersonalDocs);
router.put("/user/update-pass/:userId", userController.updatePassword);
module.exports = router;
