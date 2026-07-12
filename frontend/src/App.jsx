// src/App.jsx
import React, { useState, useEffect } from 'react';
import './style-v2.css';
import BookCard from './BookCard';
import AddBookModal from './AddBookModal';
import BookDetailsModal from './BookDetailsModal';
import AuthModal from './AuthModal';
import EditBookModal from './EditBookModal';
import { Search, Library, LogOut, LogIn, BookOpen, Clock, Heart, ShieldCheck, Plus, X } from 'lucide-react';

function App() {
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);

  // --- AUTH STATE ---
  const [user, setUser] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [editBook, setEditBook] = useState(null); // book being edited

  // --- SEARCH STATE ---
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // --- PAGINATION STATE ---
  const [currentPage, setCurrentPage] = useState(1);
  const booksPerPage = 12;

  // *** ADMIN RULE ***
  const ADMIN_EMAIL = 'abdasath003@gmail.com';
  const isAdmin = userEmail === ADMIN_EMAIL;

  // ── Fetch Books ──────────────────────────────────────────
  // Fisher-Yates shuffle — new random order on every reload
  const shuffleArray = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  const fetchBooks = () => {
    setIsLoading(true);
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/books`)
      .then(res => {
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        return res.json();
      })
      .then(data => {
        setBooks(Array.isArray(data) ? shuffleArray(data) : []);
        setTimeout(() => setIsLoading(false), 400);
      })
      .catch(err => {
        console.error('Error fetching books:', err);
        setBooks([]);
        setTimeout(() => setIsLoading(false), 400);
      });
  };

  useEffect(() => {
    fetchBooks();

    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('username');
    const savedEmail = localStorage.getItem('email');
    if (token && savedUser) {
      setUser(savedUser);
      setUserEmail(savedEmail);
    }
  }, []);

  // ── Auth Handlers ────────────────────────────────────────
  const handleLogin = (token, username, email) => {
    localStorage.setItem('token', token);
    localStorage.setItem('username', username);
    localStorage.setItem('email', email);
    setUser(username);
    setUserEmail(email);
  };

  const confirmLogout = () => {
    localStorage.clear();
    setUser(null);
    setUserEmail(null);
    setIsLogoutModalOpen(false);
  };

  // ── Book CRUD ────────────────────────────────────────────
  const addBook = (bookData, setError) => {
    // ── Client-side duplicate check (instant, no server needed) ──
    const isDuplicate = books.some(
      b => b.title.trim().toLowerCase() === bookData.title.trim().toLowerCase()
    );
    if (isDuplicate) {
      setError(`"${bookData.title}" is already in the library.`);
      return; // keep modal open
    }

    // ── Optimistic UI: show the card instantly before server responds ──
    const tempId = `temp_${Date.now()}`;
    const optimisticBook = { ...bookData, _id: tempId, _isOptimistic: true };
    setBooks(prev => [...prev, optimisticBook]);
    setIsAddModalOpen(false); // close modal immediately

    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/books`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookData),
    })
      .then(res => {
        if (res.status === 409) throw new Error('duplicate');
        if (!res.ok) throw new Error('server_error');
        return res.json();
      })
      .then(newBook => {
        // Replace the temporary card with the real DB entry
        setBooks(prev => prev.map(b => b._id === tempId ? newBook : b));
      })
      .catch(err => {
        // Rollback the optimistic card
        setBooks(prev => prev.filter(b => b._id !== tempId));
        console.error('Error adding book:', err.message);
      });
  };

  const deleteBook = (id) => {
    const prev = books;
    setBooks(books.filter(book => book._id !== id));
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/books/${id}`, { method: 'DELETE' })
      .catch(err => {
        console.error('Error deleting book:', err);
        setBooks(prev); // rollback on failure
      });
  };

  const updateBook = (id, updatedData) => {
    // ── Optimistic UI: update card instantly ──
    setBooks(prev => prev.map(b => b._id === id ? { ...b, ...updatedData } : b));
    setEditBook(null); // close modal immediately

    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/books/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData),
    })
      .then(res => {
        if (!res.ok) throw new Error('Update failed');
        return res.json();
      })
      .then(updated => {
        // Sync with real DB response
        setBooks(prev => prev.map(b => b._id === id ? updated : b));
      })
      .catch(err => {
        console.error('Error updating book:', err);
        // Rollback by re-fetching
        fetchBooks();
      });
  };

  // ── Filtered books ───────────────────────────────────────
  const filteredBooks = books.filter((book) => {
    const term = searchTerm.toLowerCase();
    return (
      book.title.toLowerCase().includes(term) ||
      book.author.toLowerCase().includes(term)
    );
  });

  // ── Pagination Logic ─────────────────────────────────────
  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);
  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentBooks = filteredBooks.slice(indexOfFirstBook, indexOfLastBook);

  useEffect(() => {
    setCurrentPage(1); // Reset to page 1 on search
  }, [searchTerm]);

  // Smart truncated page number array — always shows first, last, current±1, and ... for gaps
  const getPageNumbers = (current, total) => {
    if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
    const pages = [1];
    if (current > 3)            pages.push('...');
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i);
    if (current < total - 2)    pages.push('...');
    pages.push(total);
    return pages;
  };

  // Scroll to top whenever page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  // Lock background scroll when any modal is open
  const isAnyModalOpen = isAuthModalOpen || isAddModalOpen || isLogoutModalOpen || !!selectedBook || !!editBook;
  useEffect(() => {
    document.body.style.overflow = isAnyModalOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isAnyModalOpen]);

  // ── Render ───────────────────────────────────────────────
  return (
    <div className="App">

      {/* ── NAVBAR ── */}
      <nav className="navbar">
        <div className="logo-container">
          <h1 onClick={() => { setSearchTerm(''); setSelectedBook(null); fetchBooks(); }}
              style={{ cursor: 'pointer' }}>
            ChapterVerse.
          </h1>
        </div>

        <div className="search-container">
          <input
            type="text"
            placeholder="Search books or authors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="auth-container" style={{ gap: '12px', display: 'flex', alignItems: 'center' }}>
          {user ? (
            <>
              <span className="user-badge">
                {user}
                {isAdmin && <span style={{ color: '#fbbf24', fontSize: '0.75rem', marginLeft: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}><ShieldCheck size={14} /> Admin</span>}
              </span>
              <button
                onClick={() => setIsLogoutModalOpen(true)}
                className="btn-secondary"
                style={{ padding: '8px 16px', borderRadius: '20px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <LogOut size={16} /> Logout
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="btn-primary"
              style={{ padding: '9px 22px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <LogIn size={18} /> Sign In
            </button>
          )}
        </div>
      </nav>

      {/* ── HERO SECTION ── */}
      {!searchTerm && (
        <section className="hero">
          <h2 className="hero-title">Your Digital Library,<br />Beautifully Curated.</h2>
          <p className="hero-subtitle">
            Discover, explore, and download books from our ever-growing collection.
          </p>
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-value" style={{ display: 'flex', alignItems: 'center', height: '28px' }}><BookOpen size={24} color="var(--purple-400)" /></span>
              <span className="hero-stat-label">Vast</span>
            </div>
            <div className="hero-stat" style={{ borderLeft: '1px solid rgba(255,255,255,0.08)', paddingLeft: '32px' }}>
              <span className="hero-stat-value" style={{ display: 'flex', alignItems: 'center', height: '28px', color: '#fbbf24' }}><Heart size={24} /></span>
              <span className="hero-stat-label">Free</span>
            </div>
            <div className="hero-stat" style={{ borderLeft: '1px solid rgba(255,255,255,0.08)', paddingLeft: '32px' }}>
              <span className="hero-stat-value" style={{ display: 'flex', alignItems: 'center', height: '28px' }}><Clock size={24} color="var(--purple-400)" /></span>
              <span className="hero-stat-label">24/7</span>
            </div>
          </div>
        </section>
      )}

      {/* ── SECTION HEADER ── */}
      <div className="section-header">
        <span className="section-title">
          {searchTerm ? `Results for "${searchTerm}"` : 'Library'}
        </span>
        <div className="section-line" />
      </div>

      {/* ── BOOK GRID ── */}
      <div className="container">
        {isLoading ? (
          <div className="loading-container">
            <div className="spinner" />
            <p className="loading-text">Loading your library...</p>
          </div>
        ) : currentBooks.length > 0 ? (
          currentBooks.map((book, index) => (
            <BookCard
              key={book._id}
              book={book}
              onDelete={deleteBook}
              onSelect={setSelectedBook}
              onEdit={setEditBook}
              isAdmin={isAdmin}
              index={index}
            />
          ))
        ) : (
          <div className="empty-state">
            <span className="empty-icon"><Library size={56} strokeWidth={1.5} color="rgba(255,255,255,0.4)" /></span>
            <p className="empty-title">
              {searchTerm ? 'No matches found' : 'No books yet'}
            </p>
            <p className="empty-subtitle">
              {searchTerm
                ? `We couldn't find any books matching "${searchTerm}". Try a different keyword.`
                : 'The library is empty. Add the first book to get started!'}
            </p>
          </div>
        )}
      </div>

      {/* ── PAGINATION ── */}
      {!isLoading && totalPages > 1 && (
        <div className="pagination">
          <button
            className="page-btn"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            ‹
          </button>

          <div className="page-numbers">
            {getPageNumbers(currentPage, totalPages).map((item, idx) =>
              item === '...' ? (
                <span key={`ellipsis-${idx}`} className="page-ellipsis">...</span>
              ) : (
                <button
                  key={item}
                  className={`page-btn num-btn ${currentPage === item ? 'active' : ''}`}
                  onClick={() => setCurrentPage(item)}
                >
                  {item}
                </button>
              )
            )}
          </div>

          <button
            className="page-btn"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            ›
          </button>
        </div>
      )}

      {/* ── FOOTER ── */}
      <footer className="footer">
        <span className="footer-brand">ChapterVerse.</span>
        <span className="footer-text">© {new Date().getFullYear()} · Built with ♥</span>
        <span className="footer-tagline">Read freely. Learn endlessly.</span>
      </footer>

      {/* ── FAB (Admin only) ── */}
      {isAdmin && (
        <button className="add-button" onClick={() => setIsAddModalOpen(true)} title="Add a new book">
          <Plus size={28} />
        </button>
      )}

      {/* ── MODALS ── */}
      {isAuthModalOpen && (
        <AuthModal onClose={() => setIsAuthModalOpen(false)} onLogin={handleLogin} />
      )}
      {isAddModalOpen && (
        <AddBookModal onClose={() => setIsAddModalOpen(false)} onAdd={addBook} />
      )}
      {selectedBook && (
        <BookDetailsModal book={selectedBook} onClose={() => setSelectedBook(null)} />
      )}
      {editBook && (
        <EditBookModal
          book={editBook}
          onClose={() => setEditBook(null)}
          onUpdate={updateBook}
        />
      )}

      {/* ── LOGOUT CONFIRM MODAL ── */}
      {isLogoutModalOpen && (
        <div className="modal-overlay">
          <div className="modal logout-modal">
            <button className="close-btn" onClick={() => setIsLogoutModalOpen(false)}><X size={20} /></button>
            <h2>Log Out?</h2>
            <p>Are you sure you want to sign out?</p>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setIsLogoutModalOpen(false)}>
                Cancel
              </button>
              <button className="btn-danger" onClick={confirmLogout} style={{ whiteSpace: 'nowrap' }}>
                Yes, Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;