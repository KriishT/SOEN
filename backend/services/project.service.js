import Project from "../models/project.model.js";

export const createProject = async ({ name, userId }) => {
  if (!name || !userId) {
    throw new Error("Name and userId are required fields");
  }

  let project;
  try {
    project = await Project.create({ name: name, users: [userId] });
  } catch (err) {
    if (err.code === 11000) {
      throw new Error("Project name must be unique");
    }
    throw err;
  }

  return project;
};
