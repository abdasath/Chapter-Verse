// src/BookCard.jsx
import React from 'react';
import './style-v2.css';

// We accept 'isAdmin' as a prop. 
// If it is false (or missing), the delete button will NOT show.
function BookCard({ book, onDelete, onSelect, isAdmin }) {
  
  return (
    <div 
      className="book-card" 
      onClick={(e) => {
         // Safety check: Don't open book if we clicked the delete button
         if(e.target.className === 'delete-btn') return;
         onSelect(book);
      }}
    >
      <img 
        src={book.coverImageURL || "https://placehold.co/128x128/333333/FFFFFF?text=No+Cover"} 
        alt={book.title} 
        className="book-cover"
      />
      
      {/* STRICT CHECK: Only show button if isAdmin is explicitly true */}
      {isAdmin && (
        <button 
          className="delete-btn"
          onClick={(e) => {
            e.stopPropagation(); // Prevents the card click
            onDelete(book._id);
          }}
        >
          &times;
        </button>
      )}

      <div className="book-info">
        <h3>{book.title}</h3>
        <p>{book.author}</p>
      </div>
    </div>
  );
}

export default BookCard;