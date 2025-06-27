import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { API_URL } from '../config';
import Layout from '../components/Layout';

const TaskMarketplace = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      setError(null);
      try {
        let url = `${API_URL}/api/tasks?available=true&search=${searchQuery}`;
        
        const response = await axios.get(url);

        if (response.data.success) {
          setTasks(response.data.tasks);
        } else {
          setError('Failed to fetch tasks.');
        }
      } catch (err) {
        console.error('Error fetching tasks:', err);
        setError('An error occurred while fetching tasks.');
      } finally {
        setLoading(false);
      }
    };

    const debounceFetch = setTimeout(() => {
        fetchTasks();
    }, 500);

    return () => clearTimeout(debounceFetch);
  }, [searchQuery]);

  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return `https://ui-avatars.com/api/?name=?&background=random`;
    return avatarPath.startsWith('http') ? avatarPath : `${API_URL}/${avatarPath}`;
  };

  return (
    <Layout>
      <div className="bg-white min-h-screen">
        <div className="container mx-auto px-6 py-12">
          {/* Header */}
          <div className="bg-black text-white rounded-xl p-10 mb-10 text-center border border-black">
            <h1 className="text-4xl font-bold mb-4">Task Marketplace</h1>
            <p className="text-gray-200 max-w-2xl mx-auto">
              Browse available tasks from our community members and find opportunities that match your skills.
            </p>
            <Link 
              to="/create-task"
              className="mt-6 inline-flex items-center justify-center px-5 py-3 border border-black text-base font-medium rounded-md text-black bg-white hover:bg-gray-100"
            >
              + Create Task
            </Link>
          </div>
          {/* Search Bar Only */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-black mb-8 flex justify-end">
            <div className="relative w-full max-w-md">
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-800"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
          </div>
          {/* Task Grid or Message */}
          <div className="text-center py-16 text-gray-700">
            {loading && <p>Loading tasks...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {!loading && !error && tasks.length === 0 && (
              <p>No tasks available at the moment.</p>
            )}
            {/* Render tasks if they exist */}
            {!loading && !error && tasks.length > 0 && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {tasks.map(task => (
                  <div key={task._id} className="bg-white rounded-xl shadow-md border border-black p-6 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">{task.category}</span>
                      <span className="font-bold text-green-600">{task.credits} Credits</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{task.title}</h3>
                    <p className="text-gray-600 flex-grow mb-4">{task.description}</p>
                    <div className="border-t border-gray-100 pt-4">
                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <span>by <span className="font-medium text-gray-800">{task.creator?.name || '...'}</span></span>
                        <span>{new Date(task.createdAt).toLocaleDateString()}</span>
                      </div>
                      <Link to={`/tasks/${task._id}`} className="block w-full text-center bg-gray-100 text-gray-800 font-medium py-3 rounded-lg mt-4 hover:bg-gray-200">
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TaskMarketplace; 