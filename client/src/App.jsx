import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';

function App() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [darkMode, setDarkMode] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const categories = ['All', 'Work', 'Personal', 'Ideas', 'Others'];
  const categoryColors = {
    Work: 'bg-blue-500',
    Personal: 'bg-green-500',
    Ideas: 'bg-purple-500',
    Others: 'bg-gray-500',
  };

  // Fetch notes on mount
  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/notes');
      if (!response.ok) throw new Error('Failed to fetch notes');
      const data = await response.json();
      setNotes(data);
      setError(null);
    } catch {
      setError('Unable to load notes. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !content) return setError('Title and content are required');

    setIsLoading(true);
    try {
      const newNote = { title, content, category: category || 'Others' };
      const url = editId ? `/api/notes/${editId}` : '/api/notes';
      const method = editId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newNote),
      });

      if (!response.ok) throw new Error(editId ? 'Failed to update note' : 'Failed to add note');

      setTitle('');
      setContent('');
      setCategory('');
      setEditId(null);
      setError(null);
      fetchNotes();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/notes/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete note');
      fetchNotes();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
      setConfirmDelete(null);
    }
  };

  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'All' || note.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div
      className={`min-h-screen transition-colors duration-500 ${
        darkMode
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white'
          : 'bg-gradient-to-br from-blue-50 via-white to-purple-100 text-gray-900'
      }`}
    >
      <div className="container mx-auto p-6 max-w-4xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-extrabold drop-shadow-md">✨ Gorgeous Notes</h1>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-3 rounded-full bg-white/40 dark:bg-gray-700 shadow hover:scale-110 transition"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>

        {/* Search & Filters */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="🔍 Search notes..."
            className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:text-white"
          />
          <div className="flex gap-2 mt-4 flex-wrap">
            {categories.map((cat) => (
              <motion.button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                whileTap={{ scale: 0.9 }}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold shadow transition ${
                  filterCategory === cat
                    ? 'bg-blue-500 text-white'
                    : 'bg-white/50 dark:bg-gray-700 dark:text-gray-200'
                }`}
              >
                {cat}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md flex justify-between items-center shadow">
            <p>{error}</p>
            <button onClick={fetchNotes} className="underline">Retry</button>
          </div>
        )}

        {/* Note Form */}
        <motion.form
          onSubmit={handleSubmit}
          className="mb-10 p-6 bg-white/70 dark:bg-gray-800 rounded-xl shadow-lg backdrop-blur-md"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note Title"
            className="w-full p-3 mb-3 rounded-lg border dark:bg-gray-700 dark:border-gray-600"
            required
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write something magical..."
            className="w-full p-3 mb-3 rounded-lg border dark:bg-gray-700 dark:border-gray-600"
            rows="4"
            required
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-3 mb-4 rounded-lg border dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="">Select Category</option>
            {categories.slice(1).map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <div className="flex gap-3">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 disabled:bg-blue-300"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : editId ? 'Update Note' : 'Add Note'}
            </button>
            <button
              type="button"
              onClick={() => { setTitle(''); setContent(''); setCategory(''); setEditId(null); setError(null); }}
              className="px-6 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg shadow hover:bg-gray-400 dark:hover:bg-gray-500"
            >
              Clear
            </button>
          </div>
        </motion.form>

        {/* Notes List */}
        <AnimatePresence>
          <ul className="space-y-5">
            {filteredNotes.map((note) => (
              <motion.li
                key={note._id}
                className="p-5 rounded-xl shadow-lg bg-white/70 dark:bg-gray-800 backdrop-blur-md flex justify-between items-start"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="max-w-md">
                  <h3 className="text-xl font-bold">{note.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{note.content}</p>
                  <div className="flex items-center gap-3 mt-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className={`px-2 py-0.5 rounded-full text-white ${categoryColors[note.category] || 'bg-gray-500'}`}>
                      {note.category || 'Others'}
                    </span>
                    <span>{new Date(note.createdAt).toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setTitle(note.title); setContent(note.content); setCategory(note.category || ''); setEditId(note._id); }}
                    className="px-3 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => setConfirmDelete(note._id)}
                    className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    ❌
                  </button>
                </div>
              </motion.li>
            ))}
          </ul>
        </AnimatePresence>

        {/* Confirm Delete Modal */}
        <AnimatePresence>
          {confirmDelete && (
            <motion.div
              className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
              >
                <p className="mb-4 text-lg font-semibold">Are you sure you want to delete?</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleDelete(confirmDelete)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setConfirmDelete(null)}
                    className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;
