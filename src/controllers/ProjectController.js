const Project = require("../models/Project");

exports.list = async (req, res) => {
  try {
    const projects = await Project.find({});
    res.json(projects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al buscar proyectos." });
  }
};
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
    const projects = await Project.find({
      "team.id": teamValue,
      isProjectClose: { $ne: true },
    });
    const results = projects.map((item) =>
      handleGetProjectProgress(item, teamValue)
    );
    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al buscar proyectos." });
  }
};

exports.getProjectNo = async (req, res) => {
  const teamValue = req.params.teamValue;

  try {
    const projects = await Project.find({
      "team.id": { $nin: [teamValue] },
      isProjectClose: { $ne: true },
    });

    const results = projects.map((item) =>
      handleGetProjectProgress(item, teamValue)
    );

    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al buscar proyectos." });
  }
};

exports.updateMisionStatus = async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const misionId = req.params.misionId;
    const newStatus = req.body.newStatus;
    const newIsFinished = req.body.isFinished;

    const user_id = req.params.userId;
    // Busca el proyecto
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ error: "Proyecto no encontrado." });
    }

    // Busca la misión dentro del proyecto
    const mission = project.mision.id(misionId);

    if (!mission) {
      return res
        .status(404)
        .json({ error: "Misión no encontrada en el proyecto." });
    }

    // Actualiza el estado y el status de la misión
    mission.isFinished = newIsFinished;
    mission.status = newStatus;

    // Guarda el proyecto actualizado
    await project.save();

    const results = handleGetProjectProgress(project, user_id);
    res.json({ message: "Misión actualizada", project: results });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Error al actualizar el estado de la misión." });
  }
};

exports.updateCloseProject = async (req, res) => {
  const projectId = req.params.projectId;
  const isFinished = req.body.isFinished;

  try {
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: "Proyecto no encontrado." });
    }
    project.isProjectClose = isFinished;
    await project.save();

    res.json(project);
  } catch (error) {
    return res.status(404).json({ error: "Erro en la peticion." });
  }
};
exports.updateMisionFinished = async (req, res) => {
  const projectId = req.params.projectId;
  const misionId = req.params.misionId;
  const isFinished = req.body.item;

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
    // await project.save();
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Error al actualizar el estado de la misión." });
  }
};
exports.getProjectsByOwner = async (req, res) => {
  const owner = req.params.owner;
  try {
    // Utiliza el método find para buscar proyectos con el mismo projectOwner
    const projects = await Project.find({ projectOwner: owner });

    if (projects.length === 0) {
      return res
        .status(404)
        .json({ error: "Ningún proyecto encontrado para ese propietario." });
    }

    const results = projects.map((item) =>
      handleGetProjectProgress(item, owner)
    );
    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

exports.getAllProjectProgress = async (req, res) => {
  try {
    // Obtener todos los proyectos
    const projects = await Project.find();

    if (!projects) {
      return res.status(404).json({ error: "No se encontraron proyectos." });
    }

    const results = projects.map(handleGetProjectProgress);
    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

exports.getProjectProgress = async (req, res) => {
  const projectId = req.params._id;
  try {
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ error: "Proyecto no encontrado." });
    }
    //calcular el porcentaje
    const daysLeft = project.deadLine;
    const totalMision = project.mision.length;
    const completedMisions = project.mision.filter(
      (mision) => mision.isFinished
    ).length;

    res.json({
      total: totalMision,
      progress: hadleGetProgress(totalMision, completedMisions),
      daysLeft: daysLeft,
      test: handleDaysLeft(daysLeft),
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Error al calcular el porcentaje de avance." });
  }
};

exports.getCloseProject = async (req, res) => {
  const teamValue = req.params.teamValue;
  try {
    const projects = await Project.find({
      "team.id": teamValue,
      isProjectClose: true,
    });

    if (!projects || projects.length === 0) {
      return res
        .status(200)
        .json({ message: "No se encontraron proyectos completados." });
    }

    const results = projects.map((item) =>
      handleGetProjectProgress(item, teamValue)
    );
    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al buscar proyectos." });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById({ _id: req.params.id });
    if (!project) {
      return res.status(404).json({
        message: `No se encontraron proyectos con ID: ${req.params.id}`,
      });
    }

    await project.remove();
    res.json({ message: "Proyecto eliminado", status: 200 });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: "Error al eliminar el proyecto",
      error: error,
    });
  }
};

exports.getprojectInfo = async (req, res) => {
  try {
    const user_id = req.params.userId;
    const project = await Project.findById({ _id: req.params.projectId });
    if (!project) {
      res.status(404).json({
        message: `No se encontraron proyectos con ID: ${req.params.id}`,
      });
    }
    const results = handleGetProjectProgress(project, user_id);

    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(404).json({ error: "Error." });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const updatedData = req.body;

    const project = await Project.findOneAndUpdate(
      { _id: projectId },
      updatedData,
      { new: true }
    );

    if (!project) {
      return res
        .status(404)
        .json({ error: `Proyecto con ID ${projectId} no encontrado` });
    }

    res
      .status(200)
      .json({ message: "Proyecto actualizado exitosamente", project });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar el proyecto." });
  }
};

exports.updateTeam = async (req, res) => {
  const { newMemberId } = req.body;

  try {
    const project = await Project.findById(req.params.projectId);

    if (!project) {
      return res.status(404).json({
        error: `Proyecto con ID ${req.params.projectId} no encontrado`,
      });
    }

    project.team.push({ id: newMemberId });
    res
      .status(200)
      .json({ message: "Miembro agregado al equipo exitosamente", project });

    await project.save();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar el equipo." });
  }
};

exports.deleteTeamMember = async (req, res) => {
  const memberIdToDelete = req.params.memberId; // ID del miembro a eliminar

  try {
    const project = await Project.findById(req.params.projectId);

    if (!project) {
      return res.status(404).json({
        error: `Proyecto con ID ${req.params.projectId} no encontrado`,
      });
    }

    // Filtra el arreglo team para eliminar el miembro con el ID especificado
    project.team = project.team.filter(
      (member) => member.id !== memberIdToDelete
    );

    // Guarda el proyecto actualizado
    await project.save();

    res
      .status(200)
      .json({ message: "Miembro eliminado del equipo exitosamente", project });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar al miembro del equipo." });
  }
};

exports.addNewMision = async (req, res) => {
  const newMision = req.body;
  try {
    const project = await Project.findById(req.params.projectId);

    if (!project) {
      return res.status(404).json({
        error: `Proyecto con ID ${req.params.projectId} no encontrado`,
      });
    }

    project.mision.push(newMision);
    await project.save();

    res.status(200).json({ message: "Mision agregada", project });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al agregar mision." });
  }
};

function handleGetProjectProgress(project, userId) {
  const daysLeft = project.deadLine;
  const totalMision = project.mision.length;
  const setIsMemberInTeam = isMemberInTeam(project.team, userId);

  const completedMisions = project.mision.filter(
    (mision) => mision.isFinished
  ).length;
  const missionLeft = totalMision - completedMisions;
  const progress = hadleGetMisionProgress(totalMision, completedMisions);
  const daysLeftCount = handleDaysLeft(daysLeft);
  const lastMissionId = getLastMissionId(project);

  return {
    total: totalMision,
    completedMisions: completedMisions,
    progress: progress,
    daysLeft: daysLeftCount,
    isMemberInTeam: setIsMemberInTeam,
    lastMissionId: lastMissionId,
    ...project._doc,
  };
}
function getLastMissionId(project) {
  let lastId = 0;
  project.mision.forEach((mision) => {
    const misionId = parseInt(mision.id);

    if (!isNaN(misionId) && misionId > lastId) {
      lastId = misionId;
    }
  });

  return lastId.toString();
}

function hadleGetMisionProgress(totalMision, completedMisions) {
  const progressPercentage = Math.round((completedMisions / totalMision) * 100);
  return progressPercentage;
}
function handleDaysLeft(daysLeft) {
  const deadLine = new Date(daysLeft);
  const date = new Date();

  //calculate the diferent
  const diferent = deadLine - date;

  const res = Math.ceil(diferent / (1000 * 60 * 60 * 24));
  return res;
}

function isMemberInTeam(teamArray, memberIdToCheck) {
  // Verificar si teamArray es un arreglo
  if (Array.isArray(teamArray)) {
    // Usamos el método some() para verificar si algún elemento del arreglo cumple la condición
    return teamArray.some((member) => {
      if (Array.isArray(member)) {
        // Si el elemento es un arreglo, comprobar cada elemento dentro de él
        return member.some((innerMember) => innerMember.id === memberIdToCheck);
      } else {
        // Si el elemento no es un arreglo, comprobar el valor directamente
        return member.id === memberIdToCheck;
      }
    });
  }

  // Si teamArray no es un arreglo, verificar el valor directamente
  return teamArray.id === memberIdToCheck;
}
