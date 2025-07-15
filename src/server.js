import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import dotenv from "dotenv";

// Load environment variables

const app = express();
dotenv.config();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

console.log(PORT, process.env.MONGODB_URI, "process.env.MONGODB_URI");
// MongoDB connection
mongoose.connect(
  process.env.MONGODB_URI || "mongodb://localhost:27017/docker",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

const noteSchema = new mongoose.Schema({
  title: String,
  content: String,
});

const Note = mongoose.model("Note", noteSchema);

// Serve frontend
app.get("/", async (req, res) => {
  const notes = await Note.find();
  const notesHTML = notes
    .map(
      (note) => `
      <li>
        <strong>${note.title}</strong>: ${note.content}
        <form method="POST" action="/delete/${note._id}" style="display:inline">
          <button type="submit">❌ Delete</button>
        </form>
      </li>
    `
    )
    .join("");

  res.send(`
    <h1>📝 Notes App</h1>
    <form method="POST" action="/add">
      <input name="title" placeholder="Title" required />
      <input name="content" placeholder="Content" required />
      <button type="submit">➕ Add Note</button>
    </form>
    <ul>${notesHTML}</ul>
  `);
});

// Add Note
app.post("/add", async (req, res) => {
  const { title, content } = req.body;
  await Note.create({ title, content });
  res.redirect("/");
});

// Delete Note
app.post("/delete/:id", async (req, res) => {
  await Note.findByIdAndDelete(req.params.id);
  res.redirect("/");
});

// API Routes
app.get("/api/notes", async (req, res) => {
  const notes = await Note.find();
  res.json(notes);
});

app.get("/api/notes/:id", async (req, res) => {
  const note = await Note.findById(req.params.id);
  if (!note) return res.status(404).json({ message: "Note not found" });
  res.json(note);
});

app.put("/api/notes/:id", async (req, res) => {
  const note = await Note.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (!note) return res.status(404).json({ message: "Note not found" });
  res.json(note);
});

app.delete("/api/notes/:id", async (req, res) => {
  const result = await Note.findByIdAndDelete(req.params.id);
  if (!result) return res.status(404).json({ message: "Note not found" });
  res.json({ message: "Note deleted" });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
