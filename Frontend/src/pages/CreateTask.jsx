import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

const CreateTask = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    credits: '',
    deadline: '',
    estimatedHours: '',
    category: '',
  });
  const [skillsInput, setSkillsInput] = useState('');
  const [skills, setSkills] = useState([]);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [userCredits, setUserCredits] = useState(0);
  const [creditsError, setCreditsError] = useState(null);
  const [descSuggestions, setDescSuggestions] = useState([]);
  const [titleSuggestions, setTitleSuggestions] = useState([]);
  const [titleSuggestionSelected, setTitleSuggestionSelected] = useState(false);
  const [descSuggestionSelected, setDescSuggestionSelected] = useState(false);
  const [descError, setDescError] = useState(null);

  useEffect(() => {
    if (!token) navigate('/login');

    const fetchUserCredits = async () => {
      if (user && token) {
        try {
          const config = { headers: { 'Authorization': `Bearer ${token}` } };
          const response = await axios.get(`${API_URL}/api/users/profile`, config);
          console.log('Fetched user profile for credits:', response.data);
          setUserCredits(response.data.user?.credits ?? 0);
          setCreditsError(null);
        } catch (err) {
          setUserCredits(0);
          setCreditsError('Could not fetch your credits. Please refresh or check your login.');
          console.error('Error fetching user credits:', err, err?.response?.data);
        }
      }
    };
    fetchUserCredits();
  }, [user, token, navigate]);

  useEffect(() => {
    if (descSuggestionSelected) return;
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
  }, [formData.description, descSuggestionSelected]);

  useEffect(() => {
    if (titleSuggestionSelected) return;
    const fetchTitleSuggestions = async () => {
      if (formData.title.length > 2) {
        try {
          const res = await axios.get(`${API_URL}/api/tasks/autocomplete-titles?query=${encodeURIComponent(formData.title)}`);
          if (res.data.success) setTitleSuggestions(res.data.suggestions);
        } catch {}
      } else {
        setTitleSuggestions([]);
      }
    };
    const debounce = setTimeout(fetchTitleSuggestions, 600);
    return () => clearTimeout(debounce);
  }, [formData.title, titleSuggestionSelected]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    if (name === 'description') {
      setFormData({
        ...formData,
        [name]: value.slice(0, 1000)
      });
      setDescError(null);
    } else {
      setFormData({
        ...formData,
        [name]: type === 'number' ? Math.max(0, Number(value)) : value
      });
    }
  };

  const handleAddSkill = () => {
    if (skillsInput.trim() && !skills.includes(skillsInput.trim())) {
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

    if (formData.credits > userCredits) {
      setError('Credits offered cannot exceed your available balance.');
      return;
    }

    try {
      const config = { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` } };
      const taskData = { ...formData, skills };
      const res = await axios.post(`${API_URL}/api/tasks`, taskData, config);

      setMessage('Task created successfully!');
      setTimeout(() => navigate(`/tasks/${res.data.task._id}`), 1500);
    } catch (err) {
      if (err?.response?.data?.error?.includes('Description cannot be more than 1000 characters')) {
        setDescError('Description cannot be more than 1000 characters. Please shorten your description.');
      } else {
        setError(err.response?.data?.message || 'Failed to create task.');
      }
    }
  };

  return (
    <Layout>
      <div className="bg-white min-h-screen">
        <div className="container mx-auto px-6 py-12">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-black">Create a New Task</h1>
            <p className="text-gray-900 mt-2">Describe what you need help with and how many credits you're offering.</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main Form */}
            <div className="lg:col-span-2 bg-white p-8 rounded-xl shadow-md border border-gray-100">
              {message && <div className="mb-6 bg-green-100 text-green-800 p-4 rounded-lg">{message}</div>}
              {error && <div className="mb-6 bg-red-100 text-red-800 p-4 rounded-lg">{error}</div>}
              {creditsError && (
                <div className="mb-4 bg-red-100 text-red-800 p-2 rounded-lg text-center">{creditsError}</div>
              )}
              {descError && (
                <div className="mb-4 bg-red-100 text-red-800 p-2 rounded-lg text-center">{descError}</div>
              )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">Task Title</label>
                    <input type="text" name="title" id="title" required value={formData.title} onChange={e => {
                      setFormData({ ...formData, title: e.target.value });
                      if (titleSuggestionSelected && e.target.value === '') setTitleSuggestionSelected(false);
                    }} placeholder="e.g., Website Design for Small Business" className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-800"/>
                    {titleSuggestions.length > 0 && (
                      <div className="mt-2 bg-gray-50 border border-gray-200 rounded-lg p-2">
                        <ul className="list-none pl-0">
                          {titleSuggestions.slice(0, 3).map((s, i) => (
                            <li
                              key={i}
                              className="cursor-pointer px-3 py-2 rounded-md mb-1 bg-white hover:bg-indigo-50 border border-gray-200 text-gray-800 shadow-sm transition-colors"
                              onClick={() => {
                                setFormData({ ...formData, title: s });
                                setTitleSuggestions([]);
                                setTitleSuggestionSelected(true);
                              }}
                            >
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Task Description</label>
                    <textarea
                      name="description"
                      id="description"
                      rows="5"
                      required
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Provide a detailed description of what you need..."
                      maxLength={1000}
                      className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-800"
                    />
                    <div className="text-xs text-gray-500 mt-1 text-right">
                      {formData.description.length}/1000 characters
                      {formData.description.length > 950 && (
                        <span className="text-red-500 ml-2">(Almost at limit!)</span>
                      )}
                      {formData.description.length > 100 && (
                        <span className="text-yellow-600 ml-2">(Consider keeping your description concise for better clarity!)</span>
                      )}
                    </div>
                    {descSuggestions.length > 0 && (
                      <div className="mt-2 bg-gray-50 border border-gray-200 rounded-lg p-2">
                        <ul className="list-none pl-0">
                          {descSuggestions.slice(0, 3).map((s, i) => (
                            <li
                              key={i}
                              className="cursor-pointer px-3 py-2 rounded-md mb-1 bg-white hover:bg-indigo-50 border border-gray-200 text-gray-800 shadow-sm transition-colors"
                              onClick={() => {
                                setFormData({ ...formData, description: s.slice(0, 100) });
                                setDescSuggestions([]);
                                setDescSuggestionSelected(true);
                                setDescError(null);
                              }}
                            >
                              {s.length > 100 ? s.slice(0, 100) + '... (truncated)' : s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                          <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                          <select id="category" name="category" required value={formData.category} onChange={handleChange} className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-800 bg-white">
                               <option value="">Select a category</option>
                               <option>Design</option><option>Development</option><option>Writing</option><option>Marketing</option><option>Other</option>
                          </select>
                      </div>
                       <div>
                          <label htmlFor="credits" className="block text-sm font-medium text-gray-700">Credits Offered</label>
                          <div className="mt-1 relative rounded-lg shadow-sm">
                              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                 
                              </div>
                              <input type="number" name="credits" id="credits"  required value={formData.credits} onChange={handleChange} className="block w-full rounded-lg border-gray-300 py-3 text-center focus:border-gray-800 focus:ring-gray-800"/>
                          </div>
                      </div>
                  </div>
                  
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                          <label htmlFor="deadline" className="block text-sm font-medium text-gray-700">Deadline</label>
                          <input type="date" name="deadline" id="deadline" value={formData.deadline} onChange={handleChange} className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-800"/>
                      </div>
                      <div>
                          <label htmlFor="estimatedHours" className="block text-sm font-medium text-gray-700">Estimated Hours</label>
                           <input type="number" name="estimatedHours" id="estimatedHours" min="0" value={formData.estimatedHours} onChange={handleChange} className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-800"/>
                      </div>
                  </div>

                  <div>
                      <label className="block text-sm font-medium text-gray-700">Required Skills</label>
                      <div className="mt-1 flex gap-x-2">
                          <input type="text" value={skillsInput} onChange={(e) => setSkillsInput(e.target.value)} placeholder="e.g., React, Node.js" className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-800"/>
                          <button type="button" onClick={handleAddSkill} className="rounded-lg bg-gray-800 px-4 text-sm font-semibold text-white shadow-sm hover:bg-gray-900 whitespace-nowrap">Add Skill</button>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                          {skills.map(skill => (
                              <span key={skill} className="inline-flex items-center gap-x-2 rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800">
                                  {skill}
                                  <button type="button" onClick={() => handleRemoveSkill(skill)} className="h-5 w-5 flex items-center justify-center rounded-full text-gray-500 hover:text-gray-800 hover:bg-gray-200">
                                      <svg className="h-3 w-3" fill="none" viewBox="0 0 14 14" stroke="currentColor"><path d="M1 1l12 12M13 1L1 13"/></svg>
                                  </button>
                              </span>
                          ))}
                      </div>
                  </div>
                  
                  <div className="pt-5">
                      <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm font-medium text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800">
                        Create Task
                      </button>
                  </div>
                </form>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
               <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Tips for a Great Task</h3>
                   <ul className="space-y-4 text-sm text-gray-600">
                      <li className="flex items-start gap-3">
                          <svg className="h-5 w-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                          <span>Be specific about what you need and what the final deliverable should look like.</span>
                      </li>
                       <li className="flex items-start gap-3">
                          <svg className="h-5 w-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                          <span>Set a realistic credit amount based on the complexity and time required.</span>
                      </li>
                       <li className="flex items-start gap-3">
                          <svg className="h-5 w-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                          <span>List all the skills required for someone to successfully complete the task.</span>
                      </li>
                       <li className="flex items-start gap-3">
                          <svg className="h-5 w-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                          <span>Be responsive to questions from potential task claimers.</span>
                      </li>
                  </ul>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Need Help?</h3>
                  <p className="text-sm text-gray-600 mb-4">If you have questions about creating tasks or how the platform works, check out our help center or contact support.</p>
                  <Link to="/help-center" className="text-sm font-medium text-gray-800 hover:text-gray-900">Go to Help Center &rarr;</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CreateTask; 