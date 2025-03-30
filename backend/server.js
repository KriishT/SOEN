import http from "http";
import app from "./app.js";
import dotenv from "dotenv";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import Project from "./models/project.model.js";
import { generateResult } from "./services/gemini.service.js";
import cors from "cors";

dotenv.config();

const port = process.env.PORT || 3000;
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});
app.use(cors());

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

  socket.on("project-message", async (data) => {
    try {
      // Convert string data to object if needed
      if (typeof data === "string") {
        console.log("Parsing JSON string...");
        data = JSON.parse(data);
      }
    } catch (error) {
      console.error("Error parsing JSON data:", error);
      return;
    }

    // Validate data after parsing
    if (!data || typeof data !== "object" || !data.message) {
      console.error("Received invalid data:", data);
      return;
    }
    const message = data.message;
    const aiInMessage = message.includes("@ai");
    console.log(aiInMessage);
    socket.broadcast.to(socket.roomId).emit("project-message", data);

    if (aiInMessage) {
      const prompt = message.replace("@ai", "");
      const result = await generateResult(prompt);
      io.to(socket.roomId).emit("project-message", {
        sender: "AI",
        message: result,
      });
      return;
    }
  });
  socket.on("event", (data) => {
    /* … */
  });
  socket.on("disconnect", () => {
    console.log("user disconnected");
    socket.leave(socket.roomId);
    /* … */
  });
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
