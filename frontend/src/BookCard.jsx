import React from 'react';
import './style-v2.css';
import { Trash2 } from 'lucide-react';

function BookCard({ book, onDelete, onSelect, isAdmin, index = 0 }) {
  return (
    <div
      className="book-card"
      style={{ animationDelay: `${index * 60}ms` }}
      onClick={(e) => {
        // Use closest() to safely detect delete button clicks — avoids class-name fragility
        if (e.target.closest('.delete-btn')) return;
        onSelect(book);
      }}
    >
      <img
        src={book.coverImageURL || 'https://placehold.co/200x260/1a1a26/a855f7?text=No+Cover'}
        alt={book.title}
        className="book-cover"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = 'https://placehold.co/200x260/1a1a26/a855f7?text=No+Cover';
        }}
      />

      {isAdmin && (
        <button
          className="delete-btn"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(book._id);
          }}
          title="Delete book"
        >
          <Trash2 size={16} />
        </button>
      )}

      <div className="book-info">
        <h3 title={book.title}>{book.title}</h3>
        <p>{book.author}</p>
      </div>
    </div>
  );
}

export default BookCard;