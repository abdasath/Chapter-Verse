// src/EditBookModal.jsx
import React, { useState } from 'react';
import { X } from 'lucide-react';

const EditBookModal = ({ book, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    title:         book.title         || '',
    author:        book.author        || '',
    coverImageURL: book.coverImageURL || '',
    downloadUrl:   book.downloadUrl   || '',
    description:   book.description   || '',
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.author) {
      alert('Title and Author are required!');
      return;
    }
    setIsSaving(true);
    await onUpdate(book._id, formData);
    setIsSaving(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}><X size={20} /></button>

        <div className="modal-content">
          <h2>Edit Book</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="edit-title">Title</label>
              <input
                type="text"
                id="edit-title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="edit-author">Author</label>
              <input
                type="text"
                id="edit-author"
                name="author"
                value={formData.author}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="edit-coverImageURL">Cover Image URL</label>
              <input
                type="url"
                id="edit-coverImageURL"
                name="coverImageURL"
                value={formData.coverImageURL}
                onChange={handleChange}
                placeholder="https://..."
              />
            </div>

            <div className="form-group">
              <label htmlFor="edit-downloadUrl">Download Link</label>
              <input
                type="text"
                id="edit-downloadUrl"
                name="downloadUrl"
                value={formData.downloadUrl}
                onChange={handleChange}
                placeholder="Paste PDF or book link here..."
              />
            </div>

            <div className="form-group">
              <label htmlFor="edit-description">Description</label>
              <textarea
                id="edit-description"
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
              <button type="submit" className="btn-primary" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditBookModal;
