const { Router } = require("express");
const router = Router();
const orderControlloer = require("../controllers/OrderController");
const projectController = require("../controllers/ProjectController");
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
//router.get("/project-get", projectController.list);
router.get("/project/owner/:owner", projectController.getProjectsByOwner);

router.get("/project/team/:teamValue", projectController.getProjectsByTeam);
// Ruta para obtener proyectos donde "team1" no está presente (GET)
router.get("/proyectos/teamWithout/:teamValue", projectController.getProjectNo);
router.put(
  "/project/:projectId/mision/:misionId",
  projectController.updateMisionStatus
);
router.put(
  "/project-f/:projectId/mision/:misionId",
  projectController.updateMisionFinished
);
module.exports = router;
