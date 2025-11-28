import React from 'react';

// Displays full details of a single book
const BookDetailsModal = ({ book, onClose }) => {
  return (
    // Overlay click closes the modal
    <div className="modal-overlay" onClick={onClose}>
      {/* StopPropagation prevents the overlay click from bubbling up when clicking inside the modal */}
      <div className="modal details-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content">
          <button className="close-btn" onClick={onClose}>&times;</button>
          
          <div className="book-details-header">
            <img 
                src={book.coverImageURL} 
                alt={book.title} 
                className="details-cover"
                onError={(e) => {
                    e.target.onerror = null; 
                    e.target.src = 'https://placehold.co/120x180/333333/FFFFFF?text=No+Cover'; 
                }}
            />
            <div className="text-content">
              <h2>{book.title}</h2>
              <p className="details-author">By: {book.author}</p>
            </div>
          </div>
          
          <hr style={{ borderColor: '#444' }}/>
          
          <div className="book-description">
            <h3>Description</h3>
            <p>{book.description || "No detailed description was added for this book."}</p>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default BookDetailsModal;