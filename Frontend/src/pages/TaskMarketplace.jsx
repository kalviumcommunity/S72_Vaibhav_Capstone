import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import './Pages.css';

const TaskMarketplace = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories'); // Default to All Categories
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'credits-high', 'credits-low'

  const { user, token } = useAuth();
  const navigate = useNavigate();

  const categories = ['All Categories', 'Design', 'Development', 'Writing', 'Marketing', 'Data', 'Testing', 'Education', 'Administration', 'Other'];

  // Helper function to get full avatar URL
  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return 'https://via.placeholder.com/24';
    if (avatarPath.startsWith('http')) return avatarPath;
    return `${API_URL}${avatarPath}`;
  };

  const fetchTasks = async () => {
    setLoading(true);
    try {
      let url = `${API_URL}/api/tasks?available=true`;

      if (user) {
        url += `&userId=${user._id}`;
      }
      if (searchQuery) {
        url += `&search=${encodeURIComponent(searchQuery)}`;
      }
      if (selectedCategory && selectedCategory !== 'All Categories') {
        url += `&category=${encodeURIComponent(selectedCategory)}`;
      }
      // Add sorting parameter
      url += `&sortBy=${encodeURIComponent(sortBy)}`;

      const response = await axios.get(url);
      if (response.data.success) {
        setTasks(response.data.tasks);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    // eslint-disable-next-line
  }, [searchQuery, selectedCategory, sortBy, user]);

  const handleClaimTask = async (taskId) => {
    if (!user || !token) {
      alert('You must be logged in to claim a task.');
      return;
    }
    try {
      const response = await axios.put(
        `${API_URL}/api/tasks/${taskId}/claim`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        fetchTasks();
      } else {
        alert(response.data.message || 'Failed to claim task.');
      }
    } catch (error) {
      console.error('Error claiming task:', error);
      alert(error.response?.data?.message || 'Failed to claim task');
    }
  };

  const handleUpdateTask = (taskId) => {
    navigate(`/edit-task/${taskId}`);
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }
    try {
      const response = await axios.delete(`${API_URL}/api/tasks/${taskId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data.success) {
        fetchTasks(); // Refresh the task list
        alert('Task deleted successfully!');
      } else {
        alert(response.data.message || 'Failed to delete task.');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      alert(error.response?.data?.message || 'Failed to delete task.');
    }
  };

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
    <div className="page-container task-marketplace-page">
      <div className="marketplace-header">
        <div className="header-content">
          <h1>Task Marketplace</h1>
          <p>Browse available tasks from our community members and find opportunities that match your your skills.</p>
        </div>
        {user && (
          <Link to="/create-task" className="btn btn-primary create-task-btn">
            <span className="icon">+</span> Create Task
          </Link>
        )}
      </div>

      <div className="task-filters">
        <div className="filter-categories">
          {categories.map((cat) => (
            <div
              key={cat}
              className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </div>
          ))}
        </div>

        <div className="filter-right-section">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="filter-select sort-by"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="credits-high">Credits: High to Low</option>
            <option value="credits-low">Credits: Low to High</option>
          </select>
          <div className="search-bar-container">
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="filter-input search-input"
            />
            <span className="search-icon">🔍</span>
          </div>
        </div>
      </div>

      <div className="task-list">
        {tasks.length > 0 ? (
          tasks.map((task) => {
            const isCreator = user && task.creator?._id === user._id;
            const isClaimed = task.claimant;
            const showUpdateButton = isCreator && !isClaimed;
            const showClaimButton = !isCreator && !isClaimed;

            console.log(`Task ${task._id}: isCreator=${isCreator}, isClaimed=${isClaimed}, showUpdateButton=${showUpdateButton}, showClaimButton=${showClaimButton}`);

            return (
              <div className="task-card" key={task._id}>
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
                  <div className="task-detail-item skill-tags">
                    {task.skills && task.skills.map((skill, idx) => (
                      <span key={idx} className="skill-tag">{skill}</span>
                    ))}
                  </div>
                </div>

                <div className="task-footer-details">
                  <div className="creator-info">
                    <img src={getAvatarUrl(task.creator?.avatar)} alt="Creator" className="creator-avatar" />
                    <span>by {task.creator?.name || 'N/A'}</span>
                    {task.creator?.rating && (
                      <span className="creator-rating">★ {task.creator.rating.toFixed(1)}</span>
                    )}
                  </div>
                  <span className="task-date">{new Date(task.createdAt).toLocaleDateString()}</span>
                </div>

                <div className="card-actions">
                  {isCreator && !isClaimed ? (
                    <>
                      <button className="btn btn-secondary btn-update" onClick={() => handleUpdateTask(task._id)}>
                        Update Task
                      </button>
                      <button className="btn btn-danger btn-delete" onClick={() => handleDeleteTask(task._id)}>
                        Delete Task
                      </button>
                    </>
                  ) : !isCreator && !isClaimed ? (
                    <button className="btn btn-primary" onClick={() => handleClaimTask(task._id)}>
                      Claim This Task
                    </button>
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
          <p>No tasks available at the moment.</p>
        )}
      </div>
    </div>
  );
};

export default TaskMarketplace; 