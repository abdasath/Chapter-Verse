import React from 'react';
import { X, Download, Lock } from 'lucide-react';

const BookDetailsModal = ({ book, onClose, user, onRequireAuth }) => {
  const handleDownloadClick = (e) => {
    if (!user) {
      e.preventDefault();
      onRequireAuth(book.downloadUrl);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal details-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content">
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
          
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

            {book.downloadUrl && (
              <a 
                href={user ? book.downloadUrl : '#'} 
                target={user ? "_blank" : "_self"} 
                rel="noopener noreferrer"
                className="download-btn"
                onClick={handleDownloadClick}
              >
                {user ? <Download size={16} /> : <Lock size={16} />}
                Download Book
              </a>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default BookDetailsModal;