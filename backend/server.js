import http from "http";
import app from "./app.js";
import dotenv from "dotenv";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import Project from "./models/project.model.js";

dotenv.config();

const port = process.env.PORT || 3000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.use(async (socket, next) => {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers.authorization?.split(" ")[1];

    const projectId = socket.handshake.query.projectId;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return next(new Error("Project ID is required"));
    }

    socket.project = await Project.findById(projectId);

    if (!token) {
      return next(new Error("Authentication error"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return next(new Error("Unauthorized"));
    }

    socket.user = decoded;
    next();
  } catch (err) {
    next(err);
  }
});

io.on("connection", (socket) => {
  socket.roomId = socket.project._id.toString();

  console.log("a user connected");
  socket.join(socket.roomId);

  socket.on("project-message", (data) => {
    console.log(data);
    socket.broadcast.to(socket.roomId).emit("project-message", data);
  });
  socket.on("event", (data) => {
    /* … */
  });
  socket.on("disconnect", () => {
    /* … */
  });
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
