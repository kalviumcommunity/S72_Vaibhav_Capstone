import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { API_URL } from '../config';
import Layout from '../components/Layout';

/**
 * @typedef {Object} UserProfile
 * @property {string} name
 * @property {string} email
 * @property {number} credits
 * @property {string} avatar
 * @property {string} bio
 * @property {string[]} skills
 * @property {number} tasksCompleted
 * @property {number} tasksCreated
 * @property {string} joinedDate
 * @property {number} rating
 * @property {number} ratingCount
 */

const Profile = () => {
  const { user: authUser, token, setUser } = useAuth();
  /** @type {[UserProfile|null, Function]} */
  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({ name: '', bio: '' });

  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return `https://ui-avatars.com/api/?name=${profileUser?.name || 'User'}&background=252f3f&color=fff&bold=true`;
    if (avatarPath.startsWith('http')) return avatarPath;
    return `${API_URL}/${avatarPath.replace(/^\//, '')}`;
  };

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        setLoading(false);
        setError('Please log in to view your profile.');
        return;
      }
      try {
        const response = await axios.get(`${API_URL}/api/users/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfileUser(response.data.user);
        setEditFormData({
          name: response.data.user.name || '',
          bio: response.data.user.bio || '',
        });
      } catch (err) {
        setError('Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  const handleEditChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };
  
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.put(`${API_URL}/api/users/profile`, editFormData, { headers: { Authorization: `Bearer ${token}` } });
      if (data.success) {
        setProfileUser(data.data);
        setUser(data.data);
        setIsEditing(false);
      }
    } catch (err) {
      setError('Failed to update profile.');
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      handleAvatarUpload(file);
    }
  };
  
  const handleAvatarUpload = async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      const { data } = await axios.post(`${API_URL}/api/users/upload-avatar`, formData, { headers: { Authorization: `Bearer ${token}` } });
      if (data.success) {
        setProfileUser(data.user);
        setUser(data.user);
        setAvatarFile(null);
      }
    } catch (err) {
      setError('Failed to upload avatar.');
    }
  };

  if (loading) return <div className="text-center py-20">Loading profile...</div>;
  if (error) return <div className="text-center py-20 text-red-500">{error}</div>;
  if (!profileUser) return <div className="text-center py-20">Please log in.</div>;

  return (
    <Layout>
      <div className="bg-white min-h-screen">
        <div className="container mx-auto px-6 py-12">
          <div className="max-w-xl mx-auto">
            {/* Profile Card */}
            <div className="bg-white text-black rounded-xl p-8 text-center shadow-2xl relative border border-black">
              <div className="absolute top-4 right-4">
                <button onClick={() => setIsEditing(!isEditing)} className="text-white bg-gray-700 hover:bg-black-600 px-3 py-1 rounded-md">
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </button>
              </div>
              
              <div className="relative inline-block mb-4">
                <img
                  className="h-24 w-24 rounded-full object-cover ring-4 ring-gray-700"
                  src={getAvatarUrl(profileUser.avatar)}
                  alt="User Avatar"
                />
                <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 h-8 w-8 bg-white text-gray-800 rounded-full flex items-center justify-center shadow-md cursor-pointer hover:bg-gray-100">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L14.732 6.232z" /></svg>
                  <input id="avatar-upload" type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                </label>
              </div>
              
              {isEditing ? (
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <input 
                    type="text"
                    name="name"
                    value={editFormData.name}
                    onChange={handleEditChange}
                    className="w-full bg-gray-700 text-white text-center text-2xl font-bold rounded-md py-2"
                  />
                  <textarea
                    name="bio"
                    value={editFormData.bio}
                    onChange={handleEditChange}
                    className="w-full bg-gray-700 text-white text-center rounded-md py-2"
                    rows="2"
                  ></textarea>
                  <button type="submit" className="w-full bg-white text-gray-800 font-bold py-2 px-4 rounded-md hover:bg-gray-200">
                    Save Changes
                  </button>
                </form>
              ) : (
                <>
                  <h1 className="text-2xl font-bold">{profileUser.name}</h1>
                  <p className="text-gray-300 mt-1">{profileUser.bio || 'No bio available.'}</p>
                </>
              )}
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-xl p-8 mt-8 shadow-md border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Contact Information</h2>
              <div className="space-y-4 text-gray-700">
                <div className="flex items-center">
                  <span className="font-semibold w-24">Email:</span>
                  <span>{profileUser.email}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold w-24">Joined:</span>
                  <span>{new Date(profileUser.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold w-24">Credits:</span>
                  <span>{profileUser.credits} ₵</span>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold w-24">Rating:</span>
                  <span>{profileUser.rating || 'N/A'} / 5</span>
                </div>
                <div className="flex items-start">
                  <span className="font-semibold w-24 mt-1">Skills:</span>
                  <div className="flex flex-wrap gap-2">
                    {profileUser.skills && profileUser.skills.length > 0 ? (
                      profileUser.skills.map(skill => (
                        <span key={skill} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                          {skill}
                        </span>
                      ))
                    ) : <span className="text-gray-500">No skills listed.</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;