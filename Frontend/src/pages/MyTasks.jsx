import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import './Pages.css';
import { FaEdit, FaTrash, FaCheck, FaTimes } from 'react-icons/fa';

const MyTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const fetchTasks = async () => {
    if (!user || !token) return;

    try {
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      };
      const response = await axios.get(`/tasks?userId=${user._id}`, config);
      setTasks(response.data.tasks);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Failed to load tasks.');
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchUserTasks = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_URL}/api/tasks?userId=${user._id}`);
        if (response.data.success) {
          setTasks(response.data.tasks);
        }
      } catch (error) {
        console.error('Error fetching user tasks:', error);
        setError('Failed to load tasks');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchUserTasks();
    }
  }, [user]);

  const handleUpdateTask = (taskId) => {
    navigate(`/edit-task/${taskId}`);
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task? This action cannot be undone.")) {
      return;
    }

    if (!user || !token) {
      alert('You must be logged in to delete a task.');
      return;
    }

    try {
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      };
      await axios.delete(`${API_URL}/api/tasks/${taskId}`, config);
      alert('Task deleted successfully!');
      fetchTasks(); // Refresh tasks after deletion
    } catch (err) {
      console.error('Error deleting task:', err.response?.data?.message || err.message);
      alert(`Failed to delete task: ${err.response?.data?.message || err.message}`);
    }
  };

  if (!user) {
    return <div className="error-message">Please log in to view your tasks</div>;
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading tasks...</p>
      </div>
    );
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="page-container my-tasks-page">
      <h1>My Tasks</h1>
      <p>View and manage your created and claimed tasks.</p>

      <div className="task-list">
        {tasks.length > 0 ? (
          tasks.map(task => {
            const isCreator = user && task.creator?._id === user._id;
            const isClaimed = task.claimant;
            const showActionButtons = isCreator && !isClaimed; // Show update/delete only if creator and not claimed

            return (
              <div className={`task-card ${task.status}`} key={task._id}>
                <div className="card-header-meta">
                  <span className="task-category">{task.category}</span>
                  <div className="task-credits">
                    {task.credits}
                    <span>Credits</span>
                  </div>
                </div>
                <h3>{task.title}</h3>
                <p className="task-description">{task.description.substring(0, 100)}...</p>

                <div className="task-details-row">
                  <div className="task-detail-item">
                    <span className="icon">🕒</span> {task.estimatedHours} hours
                  </div>
                  <div className="task-detail-item">
                    <span className="icon">👥</span> {task.skills.length} Skills
                  </div>
                </div>

                <div className="task-footer-details">
                  <div className="creator-info">
                    <span>by {task.creator?.name || 'N/A'}</span>
                  </div>
                  <span className="task-date">{new Date(task.createdAt).toLocaleDateString()}</span>
                </div>

                <div className="card-actions">
                  {showActionButtons ? (
                    <>
                      <button className="btn btn-secondary btn-update" onClick={() => handleUpdateTask(task._id)}>
                        Update Task
                      </button>
                      <button className="btn btn-delete" onClick={() => handleDeleteTask(task._id)}>
                        Delete Task
                      </button>
                    </>
                  ) : (
                    <Link to={`/tasks/${task._id}`} className="btn btn-secondary view-details-btn-marketplace">
                      View Details
                    </Link>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <p>You haven't created or claimed any tasks yet.</p>
        )}
      </div>
    </div>
  );
};

export default MyTasks; 