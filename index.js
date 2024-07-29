require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 5000;
const mongoURI = process.env.MONGO_URI;

app.use(bodyParser.json());

// CORS configuration
app.use(
  cors({
    origin: "https://small-creativity.netlify.app", // Ensure this matches exactly
  })
);

if (!mongoURI) {
  console.error("MONGO_URI is not defined in .env file");
  process.exit(1);
}

mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    console.error(`Trying to connect with URI: ${mongoURI}`);
  });

const responseSchema = new mongoose.Schema({
  questionId: Number,
  answer: String,
  textAnswer: String,
  timestamp: { type: Date, default: Date.now },
});
const Response = mongoose.model("Response", responseSchema);

app.post("/api/submit-response", async (req, res) => {
  const { questionId, answer, textAnswer } = req.body;
  try {
    const newResponse = new Response({ questionId, answer, textAnswer });
    await newResponse.save();
    res.status(201).send("Response saved");
  } catch (error) {
    console.error("Error saving response:", error);
    res.status(500).send("Error saving response");
  }
});

app.get("/api/log-click", async (req, res) => {
  console.log("Link was clicked");
  try {
    const responses = await Response.find({});
    res.status(200).json({ message: "Click logged", responses });
  } catch (error) {
    console.error("Error fetching responses:", error);
    res.status(500).send("Error fetching responses");
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
