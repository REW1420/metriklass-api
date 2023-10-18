const Dashboard = require("../models/Dashboard");
const Project = require("../models/Project");
const project = require("../models/Project");

exports.test = async (req, res) => {
  try {
    const kpi = await Dashboard.find({});
    if (!kpi) {
      return res.status(404).json({ msg: "No KPIs found" });
    }
    return res.send(kpi);
  } catch (error) {
    console.log(error);
  }
};

exports.createObject = async (req, res) => {
  try {
    const _date = getDate();
    const user_id = req.params.id;
    const kpi = await Dashboard.find({ user_id });

    if (!kpi || kpi.length === 0) {
      // Comprueba si no se encontraron KPIs para el usuario.
      return res.status(404).json({ message: "No KPI for this User ID!" });
    }

    if (containsDate(kpi, _date)) {
      const updateKpi = await Dashboard.findOne({ user_id, date: _date });
      if (updateKpi) {
        updateKpi.count += 1;
        await updateKpi.save();
        return res
          .status(200)
          .json({ message: "actualizado", ...updateKpi._doc });
      } else {
        return res.status(500).json({ message: "something whent wrong" });
      }
    } else {
      const newKPI = new Dashboard({
        user_id: user_id,
        count: 1,
        date: _date,
      });
      await newKPI.save();
      return res
        .status(200)
        .json({ message: "new kpi create", ...newKPI._doc });
    }
  } catch (error) {
    console.log(error);
  }
};
exports.getObject = async (req, res) => {
  try {
    const user_id = req.params.id;

    const kpi = await Dashboard.find({ user_id });
    const projects = await Project.find({
      "team.id": user_id,
    });

    const projectKpi = kpiProject(projects);

    if (!kpi || kpi.length === 0) {
      // Comprueba si no se encontraron KPIs para el usuario.
      return res.status(200).json({
        message: "No KPI for this User ID!",
        kpi: {
          date: getDate(),
          count: 0,
        },
        project: {
          total: projectKpi.totalProjects,
          pending: projectKpi.pendingProjects,
          isFinished: projectKpi.totalFinishedProjects,

          finishedPercentage: getPercentage(
            projectKpi.totalProjects,
            projectKpi.totalFinishedProjects
          ),
        },
      });
    }

    return res.status(200).json({
      kpi,
      project: {
        total: projectKpi.totalProjects,
        pending: projectKpi.pendingProjects,
        isFinished: projectKpi.totalFinishedProjects,

        finishedPercentage: getPercentage(
          projectKpi.totalProjects,
          projectKpi.totalFinishedProjects
        ),
      },
    });
  } catch (error) {
    // Manejo de errores: Imprime el error en la consola y responde con un error 500.
    console.error(error);
    return res
      .status(500)
      .json({ error: "An error occurred while fetching data." });
  }
};

function getDate() {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, "0");
  const day = String(currentDate.getDate()).padStart(2, "0");
  const formattedDate = `${year}-${month}-${day}`;
  return formattedDate;
}

function containsDate(kpi, _date) {
  return kpi.some((item) => item.date === _date);
}

function kpiProject(project) {
  const totalProjects = project.length;
  const finishedProjects = project.filter((item) => item.isProjectClose);
  const pendingProjects = totalProjects - finishedProjects.length;

  // La variable 'finishedProjects' contiene ahora los proyectos finalizados.
  const totalFinishedProjects = finishedProjects.length;

  return {
    totalProjects,
    totalFinishedProjects,
    pendingProjects,
  };
}
function updateCount(kpi, _date) {
  const updatedKPI = kpi.map((item) => {
    if (item.date === _date) {
      // Si la fecha coincide, aumenta en 1 el valor de 'count'.
      item.count += 10;
    }
    return item;
  });
  return updatedKPI;
}

function getPercentage(total, finished) {
  if (total === 0 || finished === 0) {
    return 0.0;
  }

  return (total / finished).toFixed(2);
}
