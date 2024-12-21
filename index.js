require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const app = express();

// Middleware
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

const chat = model.startChat({
  generationConfig: {
    temperature: 0.7,
    maxOutputTokens: 1000,
  },
});
let chatHistory = [];

app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;
    const result = await chat.sendMessage(message);
    const response = await result.response;

    chatHistory.push({
      role: "user",
      parts: message,
    });
    chatHistory.push({
      role: "model",
      parts: response.text(),
    });

    res.json({ response: response.text() });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to process chat message" });
  }
});
app.get("/", (req, res) => {
  res.send("Hello World");
});
// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something broke!" });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
module.exports = app;
