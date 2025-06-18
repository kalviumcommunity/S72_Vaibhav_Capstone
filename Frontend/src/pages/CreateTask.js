import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import './Pages.css';

const handleFileChange = (e) => {
  setTaskFile(e.target.files[0]);
  setFileError(null);
};

const handleFileUpload = async () => {
  if (!taskFile) {
    setFileError('Please select a file to upload.');
    return;
  }

  const formData = new FormData();
  formData.append('file', taskFile);

  try {
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`,
      },
    };

    const response = await axios.post('/api/tasks/upload-file', formData, config);

    if (response.data.success) {
      setTaskFile(null);
      setFileMessage('File uploaded successfully!');
      // Handle the uploaded file URL or ID as needed
    } else {
      setFileError(response.data.message || 'Failed to upload file.');
    }
  } catch (err) {
    console.error('Error uploading file:', err.response?.data?.message || err.message);
    setFileError(err.response?.data?.message || 'Failed to upload file.');
  }
};

const [titleSuggestions, setTitleSuggestions] = useState([]);

// Handle form input changes with autocomplete
const handleChange = (e) => {
  const { name, value, type } = e.target;
  setFormData({ 
    ...formData, 
    [name]: type === 'number' ? Number(value) : value 
  });
  
  // If the changed field is the title, fetch suggestions
  if (name === 'title' && value.length > 2) { // Fetch suggestions after 2 characters
    fetchTitleSuggestions(value);
  } else if (name === 'title') {
    setTitleSuggestions([]); // Clear suggestions if input is too short
  }
};

// Fetch title suggestions from AI
const fetchTitleSuggestions = async (query) => {
  try {
    const response = await axios.get(`${API_URL}/api/tasks/autocomplete-titles?query=${encodeURIComponent(query)}`);
    if (response.data.success) {
      setTitleSuggestions(response.data.suggestions);
    }
  } catch (err) {
    console.error('Error fetching title suggestions:', err);
    setTitleSuggestions([]);
  }
};

// Handle suggestion selection
const handleSelectTitleSuggestion = (suggestion) => {
  setFormData({ ...formData, title: suggestion });
  setTitleSuggestions([]);
};

// JSX for autocomplete UI
<div className="form-group">
  <label htmlFor="title">Task Title</label>
  <input 
    type="text" 
    id="title" 
    name="title" 
    value={formData.title} 
    onChange={handleChange} 
    placeholder="e.g., Website Design for Small Business" 
    required 
  />
  {titleSuggestions.length > 0 && (
    <ul className="autocomplete-suggestions">
      {titleSuggestions.map((suggestion, index) => (
        <li key={index} onClick={() => handleSelectTitleSuggestion(suggestion)}>
          {suggestion}
        </li>
      ))}
    </ul>
  )}
</div>