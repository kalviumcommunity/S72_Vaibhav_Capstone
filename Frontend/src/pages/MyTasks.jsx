import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import Layout from '../components/Layout';
import { Clock, Zap } from 'lucide-react';

const TaskCard = ({ task, onDelete }) => (
    <div className="card flex flex-col hover:-translate-y-1 transition-all duration-300">
        <div className="flex justify-between items-start mb-4">
            <span className="bg-primary/15 text-primary border border-primary/25 px-3 py-1 rounded text-xs font-semibold font-nav uppercase tracking-wider">{task.category}</span>
            <span className="font-heading font-bold text-primary">{task.credits} <span className="text-xs text-white/40 font-normal">Credits</span></span>
        </div>
        <h3 className="text-xl font-heading font-bold text-white mb-2">{task.title}</h3>
        <p className="text-white/55 text-sm flex-grow mb-4 line-clamp-3">{task.description}</p>
        <div className="border-t border-white/10 pt-4">
            <div className="flex justify-between items-center text-sm text-white/50">
                <span><Clock className="w-4 h-4 inline mr-1 text-primary/60" />{task.estimatedHours || 'N/A'} hrs</span>
                <span><Zap className="w-4 h-4 inline mr-1 text-primary/60" />{task.skills?.length || 0} Skills</span>
            </div>
            <div className="flex justify-between items-center mt-3 text-xs text-white/40">
                <span>by <span className="font-semibold text-white/70">{task.creator?.name || '...'}</span></span>
                <span>{new Date(task.createdAt).toLocaleDateString()}</span>
            </div>
            <Link to={`/tasks/${task._id}`} className="block w-full text-center bg-primary text-white font-semibold font-nav py-2.5 rounded mt-4 hover:bg-primary-dark transition-all duration-300 uppercase tracking-wider text-sm">
                View Details
            </Link>
            <button onClick={() => onDelete(task._id)} className="block w-full text-center bg-red-500/10 border border-red-500/30 text-red-400 font-semibold py-2 rounded mt-2 hover:bg-red-500/20 transition-all duration-300 text-sm">Delete Task</button>
        </div>
    </div>
);

const MyTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserTasks = async () => {
      if (!user || !token) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const response = await axios.get(`${API_URL}/api/users/my-tasks`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.success) {
          const seen = new Set();
          const unique = response.data.tasks.filter(t => {
            const key = t._id?.toString();
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          });
          setTasks(unique);
        } else {
            setError('Failed to fetch tasks.');
        }
      } catch (error) {
        console.error('Error fetching user tasks:', error);
        setError('Failed to load tasks');
      } finally {
        setLoading(false);
      }
    };

    fetchUserTasks();
  }, [user, token]);

  const handleDelete = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await axios.delete(`${API_URL}/api/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(tasks.filter(t => t._id !== taskId));
    } catch (err) {
      alert('Failed to delete task.');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark">
        <div className="text-center">
            <p className="text-lg text-white/60 mb-4">Please log in to view your tasks.</p>
            <Link to="/login" className="px-6 py-2.5 bg-primary text-white rounded font-semibold font-nav hover:bg-primary-dark transition-all duration-300 uppercase tracking-wider text-sm">
                Login
            </Link>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-dark">
        <div className="container mx-auto px-6 py-12">
          <div className="mb-10">
            <h1 className="text-4xl font-heading font-bold text-white">My Tasks</h1>
            <p className="text-white/55 mt-2">View and manage your created and claimed tasks.</p>
          </div>

          {loading && (
            <div className="text-center py-12">
              <div className="w-10 h-10 border-4 border-white/10 border-t-primary rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-white/50">Loading tasks...</p>
            </div>
          )}
          {error && <p className="text-center text-red-400">{error}</p>}
          
          {!loading && !error && tasks.length === 0 && (
              <div className="text-center py-16 card">
                  <p className="text-white/50">You don't have any tasks yet.</p>
                  <Link to="/create-task" className="mt-4 inline-block px-6 py-2.5 bg-primary text-white rounded font-semibold font-nav hover:bg-primary-dark transition-all duration-300 uppercase tracking-wider text-sm">
                      Create a Task
                  </Link>
              </div>
          )}

          {!loading && !error && tasks.length > 0 && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {tasks.map(task => <TaskCard key={task._id} task={task} onDelete={handleDelete} />)}
              </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default MyTasks; 