import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const handleAvatarChange = (e) => {
  setAvatarFile(e.target.files[0]);
  setUploadMessage(null);
  setUploadError(null);
};

const handleAvatarUpload = async () => {
  if (!avatarFile) {
    setUploadError('Please select a file to upload.');
    return;
  }

  if (!token) {
    setUploadError('You must be logged in to upload an avatar.');
    return;
  }

  const formData = new FormData();
  formData.append('avatar', avatarFile);

  try {
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`,
      },
    };

    const response = await axios.post('/api/users/upload-avatar', formData, config);

    if (response.data.success) {
      const updatedUser = {
        ...response.data.user,
        _id: response.data.user.id
      };
      setProfileUser(updatedUser);
      setUser(updatedUser);
      setUploadMessage('Avatar uploaded successfully!');
      setAvatarFile(null);
    } else {
      setUploadError(response.data.message || 'Failed to upload avatar.');
    }
  } catch (err) {
    console.error('Error uploading avatar:', err.response?.data?.message || err.message);
    setUploadError(err.response?.data?.message || 'Failed to upload avatar.');
  }
};