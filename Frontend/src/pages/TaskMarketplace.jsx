import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { API_URL } from '../config';
import Layout from '../components/Layout';
import { Search, ClipboardList } from 'lucide-react';

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
    if (!avatarPath) return '/default-avatar.svg';
    return avatarPath.startsWith('http') ? avatarPath : `${API_URL}/${avatarPath}`;
  };

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Hero Banner */}
        <div className="relative bg-dark py-16 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -right-20 -top-20 w-96 h-96 rounded-full bg-primary/30"></div>
            <div className="absolute -left-20 -bottom-20 w-72 h-72 rounded-full bg-primary/20"></div>
          </div>
          <div className="relative container mx-auto px-6 text-center">
            <span className="text-primary font-nav font-semibold text-sm uppercase tracking-widest">Explore</span>
            <h1 className="text-4xl font-heading font-bold text-white mt-3 mb-4">Task Marketplace</h1>
            <p className="text-gray-400 max-w-2xl mx-auto mb-8">
              Browse available tasks from our community members and find opportunities that match your skills.
            </p>
            <Link
              to="/create-task"
              className="inline-flex items-center justify-center px-6 py-3 border-2 border-primary text-primary font-nav font-semibold rounded hover:bg-primary hover:text-white transition-all duration-300 text-sm uppercase tracking-wider"
            >
              + Create Task
            </Link>
          </div>
        </div>

        {/* Search + Content */}
        <div className="bg-dark py-12">
          <div className="container mx-auto px-6">
            {/* Search Bar */}
            <div className="max-w-lg mb-10">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input pl-10"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
              </div>
            </div>

            {/* States */}
            {loading && (
              <div className="text-center py-16">
                <div className="w-12 h-12 border-4 border-white/10 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-white/50">Loading tasks...</p>
              </div>
            )}
            {error && <p className="text-center py-16 text-red-400">{error}</p>}
            {!loading && !error && tasks.length === 0 && (
              <div className="text-center py-16">
                <ClipboardList className="w-10 h-10 text-primary mx-auto mb-4" />
                <p className="text-white/50 text-lg">No tasks available at the moment.</p>
              </div>
            )}

            {/* Task Grid */}
            {!loading && !error && tasks.length > 0 && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tasks.map(task => (
                  <div key={task._id} className="card flex flex-col group hover:-translate-y-1 transition-all duration-300">
                    <div className="flex justify-between items-start mb-4">
                      <span className="bg-primary/15 text-primary border border-primary/25 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">{task.category}</span>
                      <span className="font-bold text-primary text-lg">{task.credits} ₵</span>
                    </div>
                    <h3 className="text-lg font-heading font-bold text-white mb-2 group-hover:text-primary transition-colors duration-300">{task.title}</h3>
                    <p className="text-white/55 text-sm flex-grow mb-4 line-clamp-3">{task.description}</p>
                    <div className="border-t border-white/10 pt-4">
                      <div className="flex justify-between items-center text-xs text-white/40 mb-3">
                        <span>by <span className="font-semibold text-white/70">{task.creator?.name || '...'}</span></span>
                        <span>{new Date(task.createdAt).toLocaleDateString()}</span>
                      </div>
                      <Link to={`/tasks/${task._id}`} className="block w-full text-center bg-primary text-white font-semibold font-nav py-2.5 rounded hover:bg-primary-dark transition-all duration-300 text-sm uppercase tracking-wider">
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