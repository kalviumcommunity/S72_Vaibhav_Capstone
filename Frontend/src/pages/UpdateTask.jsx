import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import './Pages.css';

const UpdateTask = () => {
  const { id } = useParams(); // Get task ID from URL
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    credits: 0,
    deadline: '',
    estimatedHours: '',
    category: '',
  });
  const [skillsInput, setSkillsInput] = useState('');
  const [skills, setSkills] = useState([]);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [taskCreatorId, setTaskCreatorId] = useState(null);
  const [isTaskClaimed, setIsTaskClaimed] = useState(false);

  useEffect(() => {
    const fetchTaskDetails = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/tasks/${id}`);
        if (response.data.success) {
          const task = response.data.task;
          setFormData({
            title: task.title || '',
            description: task.description || '',
            credits: task.credits || 0,
            deadline: task.deadline ? task.deadline.substring(0, 10) : '', // Format date for input
            estimatedHours: task.estimatedHours || '',
            category: task.category || '',
          });
          setSkills(task.skills || []);
          setTaskCreatorId(task.creator._id);
          setIsTaskClaimed(!!task.claimant); // Check if claimant exists
          setLoading(false);
        } else {
          setError(response.data.message || 'Failed to fetch task details.');
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching task details:', err.response?.data?.message || err.message);
        setError(err.response?.data?.message || 'Failed to fetch task details.');
        setLoading(false);
      }
    };

    if (id) {
      fetchTaskDetails();
    }
  }, [id]);

  useEffect(() => {
    if (!loading && user && taskCreatorId && user._id !== taskCreatorId) {
      setError('You are not authorized to update this task.');
      // Optionally redirect or hide the form
    }
    if (!loading && isTaskClaimed) {
        setError('This task has been claimed and cannot be updated.');
        // Optionally redirect or disable form fields
    }
  }, [loading, user, taskCreatorId, isTaskClaimed]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === 'number' ? Number(value) : value 
    });
  };

  const handleSkillInputChange = (e) => {
    setSkillsInput(e.target.value);
  };

  const handleAddSkill = () => {
    if (skillsInput.trim() !== '' && !skills.includes(skillsInput.trim())) {
      setSkills([...skills, skillsInput.trim()]);
      setSkillsInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (!user || !token) {
      setError('You must be logged in to update a task.');
      return;
    }

    if (user._id !== taskCreatorId) {
      setError('You are not authorized to update this task.');
      return;
    }

    if (isTaskClaimed) {
        setError('This task has been claimed and cannot be updated.');
        return;
    }

    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      };

      const taskData = {
        ...formData,
        skills: skills,
      };

      const res = await axios.put(`${API_URL}/api/tasks/${id}`, taskData, config);
      setMessage('Task updated successfully!');
      console.log(res.data);
      navigate(`/tasks/${id}`); // Redirect to single task view after update
    } catch (err) {
      console.error('Error updating task:', err.response?.data?.message || err.message);
      setError(err.response?.data?.message || 'Failed to update task.');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading task details...</p>
      </div>
    );
  }

  return (
    <div className="page-container create-task-page"> {/* Using create-task-page for consistent styling */}
      <div className="create-task-grid">
        <div className="create-task-main-form">
          <h1>Update Task</h1>
          <p className="page-description">Edit the details of your task.</p>

          {message && <div className="success-message">{message}</div>}
          {error && <div className="error-message">{error}</div>}

          {(user && user._id === taskCreatorId && !isTaskClaimed) ? (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="title">Task Title</label>
                <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} placeholder="e.g., Website Design for Small Business" required />
              </div>

              <div className="form-group">
                <label htmlFor="description">Task Description</label>
                <textarea id="description" name="description" rows="5" value={formData.description} onChange={handleChange} placeholder="Provide a detailed description of what you need..." required></textarea>
              </div>

              <div className="form-group">
                <label htmlFor="category">Category</label>
                <select id="category" name="category" value={formData.category} onChange={handleChange} required>
                  <option value="">Select a category</option>
                  <option value="Design">Design</option>
                  <option value="Development">Development</option>
                  <option value="Writing">Writing</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Data">Data</option>
                  <option value="Testing">Testing</option>
                  <option value="Education">Education</option>
                  <option value="Administration">Administration</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="credits">Credits Offered</label>
                <div className="credits-input-group">
                  <input 
                    type="number" 
                    id="credits" 
                    name="credits" 
                    value={formData.credits} 
                    onChange={handleChange} 
                    min="0" 
                    placeholder="e.g., 50"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="skillsInput">Required Skills</label>
                <div className="skills-input-group">
                  <input 
                    type="text" 
                    id="skillsInput" 
                    name="skillsInput" 
                    value={skillsInput} 
                    onChange={handleSkillInputChange} 
                    placeholder="e.g., JavaScript, Figma"
                  />
                  <button type="button" className="btn-add-skill" onClick={handleAddSkill}>Add</button>
                </div>
                <div className="skills-display">
                  {skills.map((skill, index) => (
                    <span key={index} className="skill-tag">
                      {skill} 
                      <button type="button" className="btn-remove-skill" onClick={() => handleRemoveSkill(skill)}>x</button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="estimatedHours">Estimated Time to Complete</label>
                <select id="estimatedHours" name="estimatedHours" value={formData.estimatedHours} onChange={handleChange} required>
                  <option value="">Select time estimate</option>
                  <option value="3">1-3 hours</option>
                  <option value="5">3-5 hours</option>
                  <option value="10">5-10 hours</option>
                  <option value="20">10-20 hours</option>
                  <option value="20">20+ hours</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="deadline">Deadline</label>
                <input type="date" id="deadline" name="deadline" value={formData.deadline} onChange={handleChange} required />
              </div>

              <button type="submit" className="btn-submit">Update Task</button>
            </form>
          ) : (
            <p>{error || 'You do not have permission to update this task, or it has already been claimed.'}</p>
          )}
        </div>

        <div className="create-task-sidebar">
          <div className="info-card">
            <div className="info-card-header">
              <h2>Tips for a Great Task</h2>
            </div>
            <div className="info-card-content tips-list">
              <p className="tip-item"><span className="check-icon">✔</span> Be specific about what you need and what the final deliverable should look like.</p>
              <p className="tip-item"><span className="check-icon">✔</span> Set a realistic credit amount based on the complexity and time required.</p>
              <p className="tip-item"><span className="check-icon">✔</span> List all the skills required for someone to successfully complete the task.</p>
              <p className="tip-item"><span className="check-icon">✔</span> Be responsive to questions from potential task claimers.</p>
            </div>
          </div>

          <div className="info-card">
            <div className="info-card-header">
              <h2>Need Help?</h2>
            </div>
            <div className="info-card-content">
              <p>If you have questions about creating tasks or how the platform works, check out our help center or contact support.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateTask; 