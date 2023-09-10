const Project = require("../models/Project");

exports.add = async (req, res) => {
  try {
    const project = new Project(req.body);
    await project.save();
    res.json({ message: "new project added" });
  } catch (error) {
    console.log(error);
    res.status(501).send({
      message: "Error al realizar la petición",
    });
  }
};
exports.getProjectsByTeam = async (req, res) => {
  const teamValue = req.params.teamValue;
  try {
    const projects = await Project.find({ "team.id": teamValue });
    res.json(projects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al buscar proyectos." });
  }
};

exports.getProjectNo = async (req, res) => {
  const teamValue = req.params.teamValue;

  try {
    const projects = await Project.find({ "team.id": { $nin: [teamValue] } });
    res.json(projects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al buscar proyectos." });
  }
};

exports.updateMisionStatus = async (req, res) => {
  const projectId = req.params.projectId;
  const misionId = req.params.misionId;
  const newStatus = req.body.newStatus;

  try {
    //search the project
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ error: "Proyecto no encontrado." });
    }

    //search the mission
    const mission = project.mision.find((m) => m.id.toString() === misionId);

    if (!mission) {
      return res
        .status(404)
        .json({ error: "Misión no encontrada en el proyecto." });
    }

    // Actualiza el estado de la misión
    mission.status = newStatus;

    // Guarda el proyecto actualizado
    await project.save();

    res.json(mission); // Devuelve la misión actualizada
    await project.save();
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Error al actualizar el estado de la misión." });
  }
};

exports.updateMisionFinished = async (req, res) => {
  const projectId = req.params.projectId;
  const misionId = req.params.misionId;
  const isFinished = req.body.isFinished;

  try {
    //search the project
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ error: "Proyecto no encontrado." });
    }

    //search the mission
    const mission = project.mision.find((m) => m.id.toString() === misionId);

    if (!mission) {
      return res
        .status(404)
        .json({ error: "Misión no encontrada en el proyecto." });
    }

    // Actualiza el estado de la misión
    mission.isFinished = isFinished;

    // Guarda el proyecto actualizado
    await project.save();

    res.json(mission); // Devuelve la misión actualizada
    await project.save();
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Error al actualizar el estado de la misión." });
  }
};
