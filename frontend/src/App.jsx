// src/App.jsx
import React, { useState, useEffect } from 'react';
import './style-v2.css'; 
import BookCard from './BookCard'; 
import AddBookModal from './AddBookModal'; 
import BookDetailsModal from './BookDetailsModal'; // *** NEW: Import for the details pop-up ***

function App() {
  const [books, setBooks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null); // *** NEW: State to hold the book for details modal ***

  // 1. Fetch books from our backend on load
  useEffect(() => {
    fetch('http://localhost:5000/api/books') 
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => setBooks(data))
      .catch(err => console.error("Error fetching books:", err));
  }, []);

  // 2. Function to add a new book (called from the modal)
  const addBook = (bookData) => {
    fetch('http://localhost:5000/api/books', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookData),
    })
    .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
    })
    .then(newBook => {
      setBooks([...books, newBook]);
      setIsModalOpen(false);
    })
    .catch(err => console.error("Error adding book:", err));
  };

  // 3. Function to delete a book
  const deleteBook = (id) => {
    setBooks(books.filter(book => book._id !== id));
    
    fetch(`http://localhost:5000/api/books/${id}`, { method: 'DELETE' })
      .then(res => {
        if (!res.ok) {
          throw new Error(`Delete failed: ${res.status}`);
        }
      })
      .catch(err => {
        console.error("Error deleting book:", err);
      });
  };

  // 4. Function to handle the click on a BookCard to show details
  const handleBookSelect = (book) => {
    // This immediately opens the details modal using the book data we already have.
    setSelectedBook(book); 
  };


  return (
    <div className="App">
      <div className="navbar">
        <h1 style={{ cursor: 'default' ,display: 'inline-block'}}>ChapterVerse.</h1>
      </div>
      
      <div className="container">
        {books.map(book => (
          // *** UPDATED: Passing the new onSelect handler to BookCard ***
          <BookCard 
            key={book._id} 
            book={book} 
            onDelete={deleteBook} 
            onSelect={handleBookSelect} // <-- This makes the card clickable
          />
        ))}
      </div>
      
      <button className="add-button" onClick={() => setIsModalOpen(true)}>+</button>
      
      {/* 1. Add/Edit Modal */}
      {isModalOpen && (
          <AddBookModal 
            onClose={() => setIsModalOpen(false)} 
            onAdd={addBook} 
          />
        )}
        
      {/* 2. Details Modal (Appears when selectedBook is set) */}
      {selectedBook && (
          <BookDetailsModal 
            book={selectedBook} 
            onClose={() => setSelectedBook(null)} // Click close to set state back to null
          />
        )}
    
    </div>
    
  );
  
}

export default App;