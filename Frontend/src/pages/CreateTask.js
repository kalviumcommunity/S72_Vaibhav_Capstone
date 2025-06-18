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