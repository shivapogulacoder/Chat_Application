const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("./models/User"); // you’ll create this file

app.use(express.json()); // parse JSON bodies


const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// MongoDB Connect
mongoose.connect("mongodb://localhost:27017/chatapp", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

console.log("MongoDB Connected 🚀");

// Socket Connection
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("sendMessage", (data) => {
    io.emit("receiveMessage", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Test API
app.get("/", (req, res) => {
  res.send("Chat Server Running 🚀");
});

// Register
app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashed });
    res.json({ user, token: jwt.sign({ id: user._id }, "secret") });
  } catch (err) {
    res.status(400).json({ message: "Registration failed" });
  }
});

// Login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });
    res.json({ user, token: jwt.sign({ id: user._id }, "secret") });
  } catch (err) {
    res.status(400).json({ message: "Login failed" });
  }
});


server.listen(5000, () => {
  console.log("Server running on port 5000");
});