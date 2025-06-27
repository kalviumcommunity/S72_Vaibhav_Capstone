import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import Layout from '../components/Layout';

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
      try {
        const response = await axios.get(`${API_URL}/api/tasks/${id}`);
        if (response.data.success) {
          const task = response.data.task;
          setFormData({
            title: task.title || '',
            description: task.description || '',
            credits: task.credits || 0,
            deadline: task.deadline ? task.deadline.substring(0, 10) : '',
            estimatedHours: task.estimatedHours || '',
            category: task.category || '',
          });
          setSkills(task.skills || []);
          setTaskCreatorId(task.creator._id);
          setIsTaskClaimed(!!task.claimant);
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
      setMessage('Task updated successfully!');
      console.log(res.data);
      navigate(`/tasks/${id}`);
    } catch (err) {
      console.error('Error updating task:', err.response?.data?.message || err.message);
      setError(err.response?.data?.message || 'Failed to update task.');
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-white">
        <div className="bg-white border-b border-black">
          <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
            <div className="text-center">
              <h1 className="text-3xl font-extrabold tracking-tight text-black sm:text-4xl">Update Task</h1>
              <p className="mt-4 text-lg leading-6 text-gray-900">Make changes to your existing task and save it.</p>
            </div>
          </div>
        </div>
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="overflow-hidden rounded-lg bg-white shadow-lg border border-black">
            <div className="p-8 sm:p-10">
              {message && (
                <div className="rounded-md bg-green-50 p-4 mb-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.06 0l4-5.5z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-800">{message}</p>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                 <div className="rounded-md bg-red-50 p-4 mb-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                       <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-red-800">{error}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {(user && user._id === taskCreatorId && !isTaskClaimed) ? (
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div>
                    <label htmlFor="title" className="block text-sm font-semibold leading-6 text-gray-900">
                      Task Title
                    </label>
                    <div className="mt-2.5">
                      <input
                        type="text"
                        name="title"
                        id="title"
                        placeholder="e.g., Website Design for Small Business"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        className="block w-full rounded-md border-0 py-2.5 px-3.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-semibold leading-6 text-gray-900">
                      Task Description
                    </label>
                    <div className="mt-2.5">
                      <textarea
                        name="description"
                        id="description"
                        rows="5"
                        placeholder="Provide a detailed description of what you need..."
                        value={formData.description}
                        onChange={handleChange}
                        required
                        className="block w-full rounded-md border-0 py-2.5 px-3.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                      {descSuggestions.length > 0 && (
                        <div className="mt-2 bg-gray-50 border border-gray-200 rounded-lg p-2">
                          <div className="text-xs text-gray-600 mb-1">AI Suggestions:</div>
                          <ul className="list-disc pl-5">
                            {descSuggestions.map((s, i) => (
                              <li key={i} className="cursor-pointer hover:text-black" onClick={() => setFormData({ ...formData, description: s })}>{s}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="category" className="block text-sm font-semibold leading-6 text-gray-900">
                        Category
                      </label>
                      <div className="mt-2.5">
                        <select
                          id="category"
                          name="category"
                          value={formData.category}
                          onChange={handleChange}
                          required
                          className="block w-full rounded-md border-0 py-2.5 px-3.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        >
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
                      <label htmlFor="credits" className="block text-sm font-semibold leading-6 text-gray-900">
                        Credits Offered
                      </label>
                      <div className="mt-2.5">
                        <input
                          type="number"
                          name="credits"
                          id="credits"
                          min="0"
                          placeholder="e.g., 50"
                          value={formData.credits}
                          onChange={handleChange}
                          required
                          className="block w-full rounded-md border-0 py-2.5 px-3.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="deadline" className="block text-sm font-semibold leading-6 text-gray-900">
                        Deadline
                      </label>
                      <div className="mt-2.5">
                        <input
                          type="date"
                          name="deadline"
                          id="deadline"
                          value={formData.deadline}
                          onChange={handleChange}
                          className="block w-full rounded-md border-0 py-2.5 px-3.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="estimatedHours" className="block text-sm font-semibold leading-6 text-gray-900">
                        Estimated Hours
                      </label>
                      <div className="mt-2.5">
                        <input
                          type="number"
                          name="estimatedHours"
                          id="estimatedHours"
                          min="1"
                          placeholder="e.g., 5"
                          value={formData.estimatedHours}
                          onChange={handleChange}
                          className="block w-full rounded-md border-0 py-2.5 px-3.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold leading-6 text-gray-900">Required Skills</label>
                    <div className="mt-2.5 flex gap-x-3">
                      <input
                        type="text"
                        value={skillsInput}
                        onChange={handleSkillInputChange}
                        placeholder="Add a skill..."
                        className="block w-full rounded-md border-0 py-2.5 px-3.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                      <button
                        type="button"
                        onClick={handleAddSkill}
                        className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                      >
                        Add
                      </button>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {skills.map((skill, idx) => (
                        <span key={idx} className="inline-flex items-center gap-x-2 rounded-full bg-indigo-100 px-3 py-1.5 text-sm font-medium text-indigo-700">
                          {skill}
                          <button type="button" onClick={() => handleRemoveSkill(skill)} className="-mr-1.5 h-6 w-6 flex items-center justify-center rounded-full p-1 text-indigo-700 hover:bg-indigo-200">
                            <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-10 flex items-center justify-end gap-x-6 border-t border-gray-900/10 pt-8">
                    <button type="button" onClick={() => navigate(`/tasks/${id}`)} className="text-sm font-semibold leading-6 text-gray-900">
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:flex-initial"
                    >
                      Update Task
                    </button>
                  </div>
                </form>
              ) : (
                <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-neutral-900 mb-2">Cannot Update Task</h3>
                    <p className="text-neutral-600 mb-6">
                      {user && user._id !== taskCreatorId && "You are not authorized to update this task."}
                      {isTaskClaimed && "This task has been claimed and cannot be updated."}
                    </p>
                    <button
                      onClick={() => navigate(`/tasks/${id}`)}
                      className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                      View Task Details
                    </button>
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