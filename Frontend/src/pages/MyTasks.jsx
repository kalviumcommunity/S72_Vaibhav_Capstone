import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import Layout from '../components/Layout';

const TaskCard = ({ task, onDelete }) => (
    <div className="bg-white rounded-xl shadow-md border border-black p-6 flex flex-col">
        <div className="flex justify-between items-start mb-4">
            <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">{task.category}</span>
            <span className="font-bold text-green-600">{task.credits} Credits</span>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{task.title}</h3>
        <p className="text-gray-600 flex-grow mb-4">{task.description}</p>
        <div className="border-t border-gray-100 pt-4">
            <div className="flex justify-between items-center text-sm text-gray-500">
                <span><svg className="w-5 h-5 inline mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>{task.estimatedHours || 'N/A'} hours</span>
                <span><svg className="w-5 h-5 inline mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>{task.skills?.length || 0} Skills</span>
            </div>
            <div className="flex justify-between items-center mt-3 text-sm text-gray-500">
                <span>by <span className="font-medium text-gray-800">{task.creator?.name || '...'}</span></span>
                <span>{new Date(task.createdAt).toLocaleDateString()}</span>
            </div>
            <Link to={`/tasks/${task._id}`} className="block w-full text-center bg-gray-100 text-gray-800 font-medium py-3 rounded-lg mt-4 hover:bg-gray-200">
                View Details
            </Link>
            <button onClick={() => onDelete(task._id)} className="block w-full text-center bg-red-100 text-red-800 font-medium py-2 rounded-lg mt-2 hover:bg-red-200">Delete Task</button>
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
          setTasks(response.data.tasks);
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
            <p className="text-lg text-gray-600 mb-4">Please log in to view your tasks.</p>
            <Link to="/login" className="px-6 py-2 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-900">
                Login
            </Link>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="bg-white min-h-screen">
        <div className="container mx-auto px-6 py-12">
          <div className="mb-10">
            <h1 className="text-4xl font-bold text-black">My Tasks</h1>
            <p className="text-gray-900 mt-2">View and manage your created and claimed tasks.</p>
          </div>

          {loading && <p className="text-center text-gray-500">Loading tasks...</p>}
          {error && <p className="text-center text-red-500">{error}</p>}
          
          {!loading && !error && tasks.length === 0 && (
              <div className="text-center py-16 bg-white rounded-lg shadow-sm border">
                  <p className="text-gray-600">You don't have any tasks yet.</p>
                  <Link to="/create-task" className="mt-4 inline-block px-6 py-2 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-900">
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