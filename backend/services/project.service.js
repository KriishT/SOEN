import Project from "../models/project.model.js";
import mongoose from "mongoose";

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
};

export const getAllProject = async ({ userId }) => {
  if (!userId) {
    throw new Error("User ID is required");
  }
  let allProjects;

  allProjects = await Project.find({ users: userId });
  console.log(allProjects);

  return allProjects;
};

export const addUsersToProject = async ({ projectId, users, userId }) => {
  if (!projectId) {
    throw new Error("projectId is required");
  }

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new Error("Invalid projectId");
  }

  if (!users) {
    throw new Error("users are required");
  }

  if (
    !Array.isArray(users) ||
    users.some((userId) => !mongoose.Types.ObjectId.isValid(userId))
  ) {
    throw new Error("Invalid userId(s) in users array");
  }

  if (!userId) {
    throw new Error("userId is required");
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid userId");
  }

  const project = await Project.findOne({
    _id: projectId,
    users: userId,
  });

  console.log(projectId);
  console.log(project);

  if (!project) {
    throw new Error("User not belong to this project");
  }

  const userObjectIds = users.map((user) => new mongoose.Types.ObjectId(user));

  const updatedProject = await Project.findOneAndUpdate(
    {
      _id: projectId,
    },
    {
      $addToSet: {
        users: {
          $each: userObjectIds,
        },
      },
    },
    {
      new: true,
    }
  );

  return updatedProject;
};

export const getProjectInfo = async ({ projectId }) => {
  if (!projectId) {
    throw new Error("project ID is required");
  }
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new Error("Invalid project ID");
  }
  const project = await Project.findOne({ _id: projectId }).populate("users");
  return project;
};
