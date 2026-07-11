import React from 'react';
import './style-v2.css';
import { Trash2, Pencil } from 'lucide-react';

function BookCard({ book, onDelete, onSelect, onEdit, isAdmin, index = 0 }) {
  return (
    <div
      className="book-card"
      style={{ animationDelay: `${index * 60}ms` }}
      onClick={(e) => {
        if (e.target.closest('.delete-btn') || e.target.closest('.edit-btn')) return;
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
        <div className="admin-btns">
          <button
            className="edit-btn"
            onClick={(e) => { e.stopPropagation(); onEdit(book); }}
            title="Edit book"
          >
            <Pencil size={14} />
          </button>
          <button
            className="delete-btn"
            onClick={(e) => { e.stopPropagation(); onDelete(book._id); }}
            title="Delete book"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}

      <div className="book-info">
        <h3 title={book.title}>{book.title}</h3>
        <p>{book.author}</p>
      </div>
    </div>
  );
}

export default BookCard;