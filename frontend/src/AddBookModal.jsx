// src/AddBookModal.jsx
import React, { useState } from 'react';
import { X } from 'lucide-react';

const AddBookModal = ({ onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    coverImageURL: '',
    description: '',
    downloadUrl: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setError(''); // clear error on any input change
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.author) {
      setError('Title and Author are required.');
      return;
    }
    // Pass setError so App.jsx can push a duplicate error back
    onAdd(formData, setError);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        {/* ✅ X Close button */}
        <button className="close-btn" onClick={onClose}><X size={20} /></button>

        <div className="modal-content">
          <h2>Add New Book</h2>
          {error && (
            <div className="auth-error" style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="title">Title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. The Alchemist"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="author">Author</label>
              <input
                type="text"
                id="author"
                name="author"
                value={formData.author}
                onChange={handleChange}
                placeholder="e.g. Paulo Coelho"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="coverImageURL">Cover Image URL</label>
              <input
                type="url"
                id="coverImageURL"
                name="coverImageURL"
                value={formData.coverImageURL}
                onChange={handleChange}
                placeholder="https://..."
              />
            </div>

            <div className="form-group">
              <label htmlFor="downloadUrl">Download Link</label>
              <input
                type="text"
                id="downloadUrl"
                name="downloadUrl"
                value={formData.downloadUrl}
                onChange={handleChange}
                placeholder="Paste PDF or book link here..."
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="A short description of the book..."
              />
            </div>

            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Add Book
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddBookModal;