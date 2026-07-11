// server.js (Your Node.js/Express Backend)
require('dotenv').config(); // ✅ Load .env FIRST before anything else

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;
// Middleware
app.use(cors()); // Allow React frontend to talk to this backend
app.use(express.json()); // To parse JSON bodies

const MONGO_URI = process.env.MONGODB_URI;

if (!MONGO_URI) {
  console.error('❌ MONGODB_URI is not defined!');
  process.exit(1);
}

// ── Serverless-safe connection caching ───────────────────
// In serverless, each function invocation is stateless.
// We cache the connection on the global object so it's
// reused across warm invocations instead of reconnecting every time.
let cached = global.mongoose;
if (!cached) { cached = global.mongoose = { conn: null, promise: null }; }

const connectDB = async () => {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGO_URI, { serverSelectionTimeoutMS: 30000 })
      .then(m => {
        console.log('✅ MongoDB Atlas connected successfully!');
        return m;
      });
  }
  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null; // reset so next request retries
    throw err;
  }
  return cached.conn;
};

// Ensure DB is connected before every request
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    res.status(500).json({ message: 'Database connection failed' });
  }
});

// 1. Define User Schema
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Will store hashed password
});
const User = mongoose.model('User', UserSchema);

// --- Book Model (Schema) ---
const BookSchema = new mongoose.Schema({
  title: { type: String, required: true }, // Added required for validation
  author: { type: String, required: true },
  description: String,
  coverImageURL: String,
  downloadUrl: String
});
const Book = mongoose.model('Book', BookSchema);

// --- AUTH ROUTES ---

// 2. REGISTER Endpoint
app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create User
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. LOGIN Endpoint
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Check if user exists
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // 2. Verify Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Wrong Password" });

    // 3. Generate Token
    // Make sure JWT_SECRET is defined (e.g., process.env.JWT_SECRET)
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });
    
    // 4. Send back token, username, AND email
    res.json({ 
      token, 
      username: user.username, 
      email: user.email 
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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

// PUT (update) a book
app.put('/api/books/:id', async (req, res) => {
  try {
    const updated = await Book.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ message: 'Book not found' });
    res.json(updated);
  } catch (error) {
    console.error('Error updating book:', error);
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
    res.sendStatus(204); // ✅ 204 must have no body
    // REMOVED TEMPORARY MOCK DATA
  } catch (error) {
    console.error('Error deleting book:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// ✅ Export for Vercel serverless — listen only in local dev
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;