import React, { useState } from 'react';
// Note: You will need to add CSS styles for 'modal-overlay', 'modal', and 'modal-content' 
// in your style-v2.css file to make this look correct.

const AddBookModal = ({ onClose, onAdd }) => {
  // State to manage the form inputs
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    coverImageURL: '',
    description: '',
  });

  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // Validate required fields (Title and Author based on your server.js schema)
    if (formData.title && formData.author) {
      onAdd(formData); // Call the addBook function passed from App.jsx
    } else {
      alert('Title and Author are required!');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-content">
          <h2>Add New Book</h2>
          <form onSubmit={handleSubmit}>
            
            <div className="form-group">
              <label htmlFor="title">Title:</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="author">Author:</label>
              <input
                type="text"
                id="author"
                name="author"
                value={formData.author}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="coverImageURL">Cover Image URL:</label>
              <input
                type="url"
                id="coverImageURL"
                name="coverImageURL"
                value={formData.coverImageURL}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description:</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
            </div>
            
            <div className="modal-actions">
              <button type="submit" className="btn-primary">Add Book</button>
              <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddBookModal;