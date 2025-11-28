// server.js (Your Node.js/Express Backend)
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors()); // Allow React frontend to talk to this backend
app.use(express.json()); // To parse JSON bodies

// --- MongoDB Connection ---
// NOTE: If using a local MongoDB, the URI should typically include the database name.
// If using MongoDB Atlas, replace this with your secure connection string.
// Make sure your local MongoDB service is running if you use this URI.
const MONGO_URI = 'mongodb://127.0.0.1:27017/chapterverseDB'; // Added 'mongodb://' and a database name
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected successfully!'))
  .catch(err => console.error('MongoDB connection error:', err.message)); // Added error logging

// --- Book Model (Schema) ---
const BookSchema = new mongoose.Schema({
  title: { type: String, required: true }, // Added required for validation
  author: { type: String, required: true },
  description: String,
  coverImageURL: String,
});
const Book = mongoose.model('Book', BookSchema);

// --- API Routes ---

// GET all books
app.get('/api/books', async (req, res) => {
  try {
    // *** REAL MONGODB LOGIC UNCOMMENTED ***
    const books = await Book.find();
    res.json(books);
    // REMOVED TEMPORARY MOCK DATA
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ message: 'Error fetching books' });
  }
});

// POST a new book
app.post('/api/books', async (req, res) => {
  try {
    // *** REAL MONGODB LOGIC UNCOMMENTED ***
    const newBook = new Book(req.body);
    const savedBook = await newBook.save();
    res.status(201).json(savedBook); // Use 201 status for creation
    // REMOVED TEMPORARY MOCK DATA
  } catch (error) {
    console.error('Error adding book:', error);
    res.status(400).json({ message: 'Invalid book data' });
  }
});

// DELETE a book
app.delete('/api/books/:id', async (req, res) => {
  try {
    // *** REAL MONGODB LOGIC UNCOMMENTED ***
    const result = await Book.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.status(204).json({ message: 'Book deleted' }); // Use 204 status for successful deletion
    // REMOVED TEMPORARY MOCK DATA
  } catch (error) {
    console.error('Error deleting book:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});