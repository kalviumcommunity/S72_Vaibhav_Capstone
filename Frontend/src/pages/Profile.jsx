import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { API_URL } from '../config';
import Layout from '../components/Layout';
import { Pencil } from 'lucide-react';

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

  if (loading) return (
    <Layout>
      <div className="text-center py-20">
        <div className="w-12 h-12 border-4 border-white/10 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-white/50">Loading profile...</p>
      </div>
    </Layout>
  );
  if (error) return <Layout><div className="text-center py-20 text-red-400">{error}</div></Layout>;
  if (!profileUser) return <Layout><div className="text-center py-20 text-white/50">Please log in.</div></Layout>;

  return (
    <Layout>
      <div className="min-h-screen bg-dark">
        <div className="container mx-auto px-6 py-12">
          <div className="max-w-xl mx-auto">
            {/* Profile Card */}
            <div className="card text-center relative">
              <div className="absolute top-4 right-4">
                <button onClick={() => setIsEditing(!isEditing)} className="text-white bg-primary hover:bg-primary-dark px-4 py-2 rounded text-xs font-semibold font-nav transition-all duration-300 uppercase tracking-wider">
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </button>
              </div>
              
              <div className="relative inline-block mb-4">
                <img
                  className="h-24 w-24 rounded-full object-cover ring-4 ring-primary/20"
                  src={getAvatarUrl(profileUser.avatar)}
                  alt="User Avatar"
                />
                <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 h-8 w-8 bg-primary text-white rounded-full flex items-center justify-center shadow-md cursor-pointer hover:bg-primary-dark transition-all duration-300">
                  <Pencil className="h-4 w-4" />
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
                    className="input text-center text-2xl font-heading font-bold"
                  />
                  <textarea
                    name="bio"
                    value={editFormData.bio}
                    onChange={handleEditChange}
                    className="input text-center"
                    rows="2"
                  ></textarea>
                  <button type="submit" className="w-full bg-primary text-white font-semibold font-nav py-2.5 px-4 rounded hover:bg-primary-dark transition-all duration-300 uppercase tracking-wider text-sm">
                    Save Changes
                  </button>
                </form>
              ) : (
                <>
                  <h1 className="text-2xl font-heading font-bold text-white">{profileUser.name}</h1>
                  <p className="text-white/55 mt-1">{profileUser.bio || 'No bio available.'}</p>
                </>
              )}
            </div>

            {/* Contact Information */}
            <div className="card mt-8">
              <h2 className="text-xl font-heading font-bold text-white mb-6">Contact Information</h2>
              <div className="space-y-4 text-white/60">
                <div className="flex items-center">
                  <span className="font-semibold text-white/80 w-24">Email:</span>
                  <span>{profileUser.email}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold text-white/80 w-24">Joined:</span>
                  <span>{new Date(profileUser.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold text-white/80 w-24">Credits:</span>
                  <span className="text-primary font-bold">{profileUser.credits} ₵</span>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold text-white/80 w-24">Rating:</span>
                  <span>{profileUser.rating || 'N/A'} / 5</span>
                </div>
                <div className="flex items-start">
                  <span className="font-semibold text-white/80 w-24 mt-1">Skills:</span>
                  <div className="flex flex-wrap gap-2">
                    {profileUser.skills && profileUser.skills.length > 0 ? (
                      profileUser.skills.map(skill => (
                        <span key={skill} className="bg-primary/15 text-primary border border-primary/25 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                          {skill}
                        </span>
                      ))
                    ) : <span className="text-white/40 text-sm">No skills listed.</span>}
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