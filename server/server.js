import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

// Initialize environment variables
dotenv.config();

// Constants
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/docker';

// Create Express app
const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Note Schema
const noteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
});

const Note = mongoose.model('Note', noteSchema);

// Routes
// Serve frontend
app.get('/', async (req, res) => {
  try {
    const notes = await Note.find();
    const notesHTML = notes
      .map(
        (note) => `
          <li>
            <strong>${note.title}</strong>: ${note.content}
            <form method="POST" action="/delete/${note._id}" style="display:inline;">
              <button type="submit">❌ Delete</button>
            </form>
          </li>
        `
      )
      .join('');

    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Notes App</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          form { margin: 20px 0; }
          input, button { margin: 5px; padding: 8px; }
          ul { list-style: none; padding: 0; }
          li { margin: 10px 0; }
        </style>
      </head>
      <body>
        <h1>📝 Notes App</h1>
        <form method="POST" action="/add">
          <input name="title" placeholder="Title" required />
          <input name="content" placeholder="Content" required />
          <button type="submit">➕ Add Note</button>
        </form>
        <ul>${notesHTML}</ul>
      </body>
      </html>
    `);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Add note
app.post('/add', async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(400).send('Title and content are required');
    }
    await Note.create({ title, content });
    res.redirect('/');
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Delete note
app.post('/delete/:id', async (req, res) => {
  try {
    const result = await Note.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).send('Note not found');
    }
    res.redirect('/');
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// API Routes
app.get('/api/notes', async (req, res) => {
  try {
    const notes = await Note.find();
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/notes/:id', async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    res.json(note);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/notes/:id', async (req, res) => {
  try {
    const note = await Note.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    res.json(note);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/notes/:id', async (req, res) => {
  try {
    const result = await Note.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).json({ message: 'Note not found' });
    }
    res.json({ message: 'Note deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(500).json({ message: 'Something went wrong' });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});