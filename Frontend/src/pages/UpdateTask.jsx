import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import Layout from '../components/Layout';
import { CheckCircle, XCircle, X, AlertTriangle } from 'lucide-react';

const UpdateTask = () => {
  const { id } = useParams();
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
  const [descSuggestions, setDescSuggestions] = useState([]);

  useEffect(() => {
    const fetchTaskDetails = async () => {
      if (!id) return;
      
      try {
        const config = token ? {
          headers: { 'Authorization': `Bearer ${token}` }
        } : {};
        
        const response = await axios.get(`${API_URL}/api/tasks/${id}`, config);
        if (response.data.success) {
          const task = response.data.task;
          setFormData({
            title: task.title || '',
            description: task.description || '',
            credits: task.credits || 0,
            deadline: task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : '',
            estimatedHours: task.estimatedHours || '',
            category: task.category || '',
          });
          setSkills(task.skills || []);
          setTaskCreatorId(task.creator?._id || task.creator);
          setIsTaskClaimed(!!task.claimant);
          setLoading(false);
        } else {
          setError(response.data.message || 'Failed to fetch task details.');
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching task details:', err.response?.data || err.message);
        setError(err.response?.data?.message || 'Failed to fetch task details.');
        setLoading(false);
      }
    };

    fetchTaskDetails();
  }, [id, token]);

  useEffect(() => {
    if (!loading && user && taskCreatorId && user._id !== taskCreatorId) {
      setError('You are not authorized to update this task.');
    }
    if (!loading && isTaskClaimed) {
      setError('This task has been claimed and cannot be updated.');
    }
  }, [loading, user, taskCreatorId, isTaskClaimed]);

  useEffect(() => {
    const fetchDescSuggestions = async () => {
      if (formData.description.length > 10) {
        try {
          const res = await axios.get(`${API_URL}/api/tasks/autocomplete-descriptions?query=${encodeURIComponent(formData.description)}`);
          if (res.data.success) setDescSuggestions(res.data.suggestions);
        } catch {}
      } else {
        setDescSuggestions([]);
      }
    };
    const debounce = setTimeout(fetchDescSuggestions, 600);
    return () => clearTimeout(debounce);
  }, [formData.description]);

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
      if (res.data.success) {
        setMessage('Task updated successfully!');
        setTimeout(() => {
          navigate(`/tasks/${id}`);
        }, 1000);
      } else {
        setError(res.data.message || 'Failed to update task.');
      }
    } catch (err) {
      console.error('Error updating task:', err.response?.data?.message || err.message);
      setError(err.response?.data?.message || 'Failed to update task.');
    }
  };

  const inputClasses = "input";
  const labelClasses = "block text-sm font-medium text-white/70 mb-1";

  return (
    <Layout>
      <div className="min-h-screen bg-dark">
        <div className="bg-dark py-12 sm:py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-3xl font-heading font-bold text-white sm:text-4xl">Update Task</h1>
              <p className="mt-4 text-lg text-gray-300">Make changes to your existing task and save it.</p>
            </div>
          </div>
        </div>
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="card">
            <div className="p-8 sm:p-10">
              {message && (
                <div className="rounded bg-green-500/10 border border-green-500/30 p-4 mb-6">
                  <div className="flex">
                    <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                    <p className="ml-3 text-sm font-medium text-green-400">{message}</p>
                  </div>
                </div>
              )}

              {error && (
                <div className="rounded bg-red-500/10 border border-red-500/30 p-4 mb-6">
                  <div className="flex">
                    <XCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                    <p className="ml-3 text-sm font-medium text-red-400">{error}</p>
                  </div>
                </div>
              )}
              
              {(user && user._id === taskCreatorId && !isTaskClaimed) ? (
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div>
                    <label htmlFor="title" className={labelClasses}>Task Title</label>
                    <div className="mt-1">
                      <input type="text" name="title" id="title" placeholder="e.g., Website Design for Small Business" value={formData.title} onChange={handleChange} required className={inputClasses}/>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="description" className={labelClasses}>Task Description</label>
                    <div className="mt-1">
                      <textarea name="description" id="description" rows="5" placeholder="Provide a detailed description of what you need..." value={formData.description} onChange={handleChange} required className={inputClasses}/>
                      {descSuggestions.length > 0 && (
                        <div className="mt-2 bg-dark-lighter border border-white/10 rounded p-2">
                          <div className="text-xs text-white/50 mb-1 font-semibold">AI Suggestions:</div>
                          <ul className="list-disc pl-5 text-sm text-white/60">
                            {descSuggestions.map((s, i) => (
                              <li key={i} className="cursor-pointer hover:text-primary transition-colors" onClick={() => setFormData({ ...formData, description: s })}>{s}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="category" className={labelClasses}>Category</label>
                      <div className="mt-1">
                        <select id="category" name="category" value={formData.category} onChange={handleChange} required className={inputClasses}>
                          <option value="">Select a category</option>
                          <option value="Design">Design</option>
                          <option value="Development">Development</option>
                          <option value="Writing">Writing</option>
                          <option value="Marketing">Marketing</option>
                          <option value="Consulting">Consulting</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="credits" className={labelClasses}>Credits Offered</label>
                      <div className="mt-1">
                        <input type="number" name="credits" id="credits" min="0" placeholder="e.g., 50" value={formData.credits} onChange={handleChange} required className={inputClasses}/>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="deadline" className={labelClasses}>Deadline</label>
                      <div className="mt-1">
                        <input type="date" name="deadline" id="deadline" value={formData.deadline} onChange={handleChange} className={inputClasses}/>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="estimatedHours" className={labelClasses}>Estimated Hours</label>
                      <div className="mt-1">
                        <input type="number" name="estimatedHours" id="estimatedHours" min="1" placeholder="e.g., 5" value={formData.estimatedHours} onChange={handleChange} className={inputClasses}/>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className={labelClasses}>Required Skills</label>
                    <div className="mt-1 flex gap-x-3">
                      <input type="text" value={skillsInput} onChange={handleSkillInputChange} placeholder="Add a skill..." className={inputClasses}/>
                      <button type="button" onClick={handleAddSkill} className="rounded bg-primary/20 border border-primary/40 px-4 py-2.5 text-sm font-semibold font-nav text-primary shadow-sm hover:bg-primary/30 whitespace-nowrap transition-all duration-300 uppercase tracking-wider">Add</button>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {skills.map((skill, idx) => (
                        <span key={idx} className="inline-flex items-center gap-x-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider">
                          {skill}
                          <button type="button" onClick={() => handleRemoveSkill(skill)} className="-mr-1 h-5 w-5 flex items-center justify-center rounded-full text-primary/60 hover:text-primary hover:bg-primary/20 transition-all">
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-10 flex items-center justify-end gap-x-6 border-t border-white/10 pt-8">
                    <button type="button" onClick={() => navigate(`/tasks/${id}`)} className="text-sm font-semibold text-white/50 hover:text-white transition-colors">Cancel</button>
                    <button type="submit" className="flex-1 sm:flex-initial rounded bg-primary px-6 py-2.5 text-sm font-semibold font-nav text-white shadow-sm hover:bg-primary-dark transition-all duration-300 uppercase tracking-wider">Update Task</button>
                  </div>
                </form>
              ) : (
                <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 bg-red-500/15 border border-red-500/30 rounded-full flex items-center justify-center">
                      <AlertTriangle className="w-8 h-8 text-red-400" />
                    </div>
                    <h3 className="text-xl font-heading font-bold text-white mb-2">Cannot Update Task</h3>
                    <p className="text-white/55 mb-6">
                      {user && user._id !== taskCreatorId && "You are not authorized to update this task."}
                      {isTaskClaimed && "This task has been claimed and cannot be updated."}
                    </p>
                    <button onClick={() => navigate(`/tasks/${id}`)} className="rounded bg-primary px-6 py-2.5 text-sm font-semibold font-nav text-white shadow-sm hover:bg-primary-dark transition-all duration-300 uppercase tracking-wider">View Task Details</button>
                  </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default UpdateTask;