import mongoose, { mongo } from "mongoose";

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    lowercase: true,
    requirqed: true,
    unique: [true, "Project name must be unique"],
    trim: true,
  },
  users: {
    type: mongoose.Schema.Types.ObjectId, // Reference to the User model
    ref: "user",
  },
});

const Project = mongoose.model("project", projectSchema);
export default Project;
