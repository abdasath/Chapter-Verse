import React from 'react';

// BookCard now accepts the onSelect prop
const BookCard = ({ book, onDelete, onSelect }) => {
    return (
        // The whole card is clickable via the onSelect handler
        <div className="book-card" onClick={() => onSelect(book)}> 
            {/* Fallback image if URL is bad or missing */}
            <img 
                src={book.coverImageURL} 
                alt={book.title} 
                onError={(e) => {
                    e.target.onerror = null; 
                    e.target.src = 'https://placehold.co/150x220/333333/FFFFFF?text=No+Cover'; 
                }}
            />
            <div className="card-info">
                <h3>{book.title}</h3>
                <p>{book.author}</p>
            </div>
            
            {/* The delete button must stop propagation to prevent the onSelect handler from firing */}
            <button 
                className="delete-btn" 
                onClick={(e) => { 
                    e.stopPropagation(); // Prevents details modal from opening
                    onDelete(book._id); 
                }}
            >
                &times;
            </button>
        </div>
    );
};

export default BookCard;