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
  const [category, setCategory] = useState('All Categories');
  const [sortBy, setSortBy] = useState('Newest First');

  const categories = ['All Categories', 'Design', 'Development', 'Writing', 'Marketing', 'Testing', 'Education', 'Administration', 'Other'];

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      setError(null);
      try {
        let url = `${API_URL}/api/tasks?search=${searchQuery}&sortBy=${sortBy}`;
        if (category !== 'All Categories') {
          url += `&category=${category}`;
        }
        
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
  }, [searchQuery, category, sortBy]);

  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return `https://ui-avatars.com/api/?name=?&background=random`;
    return avatarPath.startsWith('http') ? avatarPath : `${API_URL}/${avatarPath}`;
  };

  return (
    <Layout>
      <div className="bg-white min-h-screen">
        <div className="container mx-auto px-6 py-12">
          
          {/* Header */}
          <div className="bg-white text-black rounded-xl p-10 mb-10 text-center border border-black">
            <h1 className="text-4xl font-bold mb-4">Task Marketplace</h1>
            <p className="text-gray-900 max-w-2xl mx-auto">
              Browse available tasks from our community members and find opportunities that match your skills.
            </p>
            <Link 
              to="/create-task"
              className="mt-6 inline-flex items-center justify-center px-5 py-3 border border-black text-base font-medium rounded-md text-white bg-black hover:bg-gray-900"
            >
              + Create Task
            </Link>
          </div>

          {/* Filters */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-black mb-8">
              <div className="flex flex-wrap items-center gap-4">
                  <div className="flex-grow">
                      <div className="flex flex-wrap gap-2">
                          {categories.map(cat => (
                              <button
                                  key={cat}
                                  onClick={() => setCategory(cat)}
                                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                      category === cat 
                                      ? 'bg-gray-800 text-white'
                                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                  }`}
                              >
                                  {cat}
                              </button>
                          ))}
                      </div>
                  </div>
                  <div className="flex gap-4">
                      <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                           className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-800 bg-white"
                      >
                          <option>Newest First</option>
                          <option>Oldest First</option>
                      </select>
                      <div className="relative">
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
              </div>
          </div>
          
          {/* Task Grid - Now shows a message as per the design */}
          <div className="text-center py-16 text-gray-700">
              {loading && <p>Loading tasks...</p>}
              {error && <p className="text-red-500">{error}</p>}
              {!loading && !error && tasks.length === 0 && (
                  <p>No tasks available at the moment.</p>
              )}
              {/* If tasks exist, they would be mapped here. The design shows none. */}
          </div>

        </div>
      </div>
    </Layout>
  );
};

export default TaskMarketplace; 