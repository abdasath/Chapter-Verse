// src/App.jsx
import React, { useState, useEffect } from 'react';
import './style-v2.css'; 
import BookCard from './BookCard'; 
import AddBookModal from './AddBookModal'; 
import BookDetailsModal from './BookDetailsModal';
import AuthModal from './AuthModal'; 

function App() {
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  
  // --- AUTH STATE ---
  const [user, setUser] = useState(null); 
  const [userEmail, setUserEmail] = useState(null); 
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // --- NEW: Logout Confirmation State ---
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // *** ADMIN RULE ***
  const ADMIN_EMAIL = "abdasath003@gmail.com"; 
  const isAdmin = userEmail === ADMIN_EMAIL;

  // 1. Fetch Books & Check Session
  useEffect(() => {
    fetch('http://localhost:5000/api/books')
      .then(res => res.json())
      .then(data => setBooks(data))
      .catch(err => console.error("Error fetching books:", err));

    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('username');
    const savedEmail = localStorage.getItem('email'); 
    
    if (token && savedUser) {
      setUser(savedUser);
      setUserEmail(savedEmail);
    }
  }, []);

  // 2. Handle Login
  const handleLogin = (token, username, email) => {
    localStorage.setItem('token', token);
    localStorage.setItem('username', username);
    localStorage.setItem('email', email); 
    setUser(username);
    setUserEmail(email);
  };

  // 3. Handle Logout (Actual Action)
  const confirmLogout = () => {
    localStorage.clear(); 
    setUser(null);
    setUserEmail(null);
    setIsLogoutModalOpen(false); // Close the popup
  };

  // 4. Add Book Function
  const addBook = (bookData) => {
    fetch('http://localhost:5000/api/books', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookData),
    })
    .then(res => res.json())
    .then(newBook => {
      setBooks([...books, newBook]);
      setIsAddModalOpen(false);
    })
    .catch(err => console.error("Error adding book:", err));
  };

  // 5. Delete Book Function
  const deleteBook = (id) => {
    setBooks(books.filter(book => book._id !== id));
    fetch(`http://localhost:5000/api/books/${id}`, { method: 'DELETE' })
      .catch(err => console.error("Error deleting book:", err));
  };

  return (
    <div className="App">
      <div className="navbar">
        <h1 style={{ display: 'inline-block' }}>ChapterVerse.</h1>
        
        {/* Auth Buttons */}
        <div style={{ float: 'right', marginTop: '5px' }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <span className="user-badge">
                Hello, {user} {isAdmin && <span style={{color: '#ff2e2e', marginLeft:'5px'}}>(Admin)</span>}
              </span>
              
              {/* UPDATED: Click triggers the modal, not immediate logout */}
              <button 
                onClick={() => setIsLogoutModalOpen(true)} 
                className="btn-secondary" 
                style={{ padding: '8px 15px', borderRadius: '20px' }}
              >
                Logout
              </button>
            </div>
          ) : (
            <button onClick={() => setIsAuthModalOpen(true)} className="btn-primary" style={{ padding: '8px 20px', borderRadius: '20px' }}>
              Login
            </button>
          )}
        </div>
      </div>
      
      <div className="container">
        {books.map(book => (
          <BookCard 
            key={book._id} 
            book={book} 
            onDelete={deleteBook} 
            onSelect={setSelectedBook} 
            isAdmin={isAdmin} 
          />
        ))}
      </div>
      
      {isAdmin && (
        <button className="add-button" onClick={() => setIsAddModalOpen(true)}>+</button>
      )}
      
      {/* --- Existing Modals --- */}
      {isAuthModalOpen && <AuthModal onClose={() => setIsAuthModalOpen(false)} onLogin={handleLogin} />}
      {isAddModalOpen && <AddBookModal onClose={() => setIsAddModalOpen(false)} onAdd={addBook} />}
      {selectedBook && <BookDetailsModal book={selectedBook} onClose={() => setSelectedBook(null)} />}

      {/* --- NEW: Logout Confirmation Modal --- */}
      {isLogoutModalOpen && (
        <div className="modal-overlay">
          {/* UPDATED: Added style={{ maxWidth: '300px' }} to make it small */}
          <div className="modal" style={{ maxWidth: '300px' }}>
            
            <button className="close-btn" onClick={() => setIsLogoutModalOpen(false)}>&times;</button>
            
            <div className="modal-content" style={{textAlign: 'center'}}>
              <h2 style={{borderBottom: 'none', marginBottom: '10px'}}>Log Out?</h2>
              <p style={{color: '#ccc', marginBottom: '30px'}}>Are you sure?</p>
              
              <div className="modal-actions" style={{justifyContent: 'center'}}>
                <button 
                  className="btn-secondary" 
                  onClick={() => setIsLogoutModalOpen(false)}
                >
                  Cancel
                </button>

                <button 
                  className="btn-danger" 
                  onClick={confirmLogout}
                >
                  Yes, Log Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;