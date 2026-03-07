import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { X, Check } from 'lucide-react';

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
    maxBidders: '5',
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
          if (res.data.success) {
            setTitleSuggestions(res.data.suggestions || []);
          } else {
            console.warn('Title suggestions API returned success: false');
            setTitleSuggestions([]);
          }
        } catch (error) {
          console.error('Error fetching title suggestions:', error.response?.data || error.message);
          setTitleSuggestions([]);
        }
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

  const inputClasses = "input";
  const labelClasses = "block text-sm font-medium text-white/70 mb-1";
  const suggestionItemClasses = "cursor-pointer px-3 py-2 rounded mb-1 bg-dark-lighter hover:bg-primary/10 border border-white/10 text-white/60 transition-all duration-200";

  return (
    <Layout>
      <div className="min-h-screen bg-dark">
        <div className="container mx-auto px-6 py-12">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-heading font-bold text-white">Create a New Task</h1>
            <p className="text-white/55 mt-2">Describe what you need help with and how many credits you're offering.</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main Form */}
            <div className="lg:col-span-2 card">
              {message && <div className="mb-6 bg-green-500/10 border border-green-500/30 text-green-400 p-4 rounded">{message}</div>}
              {error && <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded">{error}</div>}
              {creditsError && (
                <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-400 p-2 rounded text-center">{creditsError}</div>
              )}
              {descError && (
                <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-400 p-2 rounded text-center">{descError}</div>
              )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="title" className={labelClasses}>Task Title</label>
                    <input type="text" name="title" id="title" required value={formData.title} onChange={e => {
                      setFormData({ ...formData, title: e.target.value });
                      if (titleSuggestionSelected && e.target.value === '') setTitleSuggestionSelected(false);
                    }} placeholder="e.g., Website Design for Small Business" className={inputClasses}/>
                    {titleSuggestions.length > 0 && (
                      <div className="mt-2 bg-dark-lighter border border-white/10 rounded p-2">
                        <ul className="list-none pl-0">
                          {titleSuggestions.slice(0, 3).map((s, i) => (
                            <li
                              key={i}
                              className={suggestionItemClasses}
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
                    <label htmlFor="description" className={labelClasses}>Task Description</label>
                    <textarea
                      name="description"
                      id="description"
                      rows="5"
                      required
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Provide a detailed description of what you need..."
                      maxLength={1000}
                      className={inputClasses}
                    />
                    <div className="text-xs text-white/40 mt-1 text-right">
                      {formData.description.length}/1000 characters
                      {formData.description.length > 950 && (
                        <span className="text-red-400 ml-2">(Almost at limit!)</span>
                      )}
                      {formData.description.length > 100 && (
                        <span className="text-yellow-400 ml-2">(Consider keeping your description concise for better clarity!)</span>
                      )}
                    </div>
                    {descSuggestions.length > 0 && (
                      <div className="mt-2 bg-dark-lighter border border-white/10 rounded p-2">
                        <ul className="list-none pl-0">
                          {descSuggestions.slice(0, 3).map((s, i) => (
                            <li
                              key={i}
                              className={suggestionItemClasses}
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
                          <label htmlFor="category" className={labelClasses}>Category</label>
                          <select id="category" name="category" required value={formData.category} onChange={handleChange} className={inputClasses}>
                               <option value="">Select a category</option>
                               <option>Design</option><option>Development</option><option>Writing</option><option>Marketing</option><option>Other</option>
                          </select>
                      </div>
                       <div>
                          <label htmlFor="credits" className={labelClasses}>Credits Offered</label>
                          <input type="number" name="credits" id="credits" required value={formData.credits} onChange={handleChange} className={`${inputClasses} text-center`}/>
                      </div>
                  </div>
                  
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                          <label htmlFor="deadline" className={labelClasses}>Deadline</label>
                          <input type="date" name="deadline" id="deadline" value={formData.deadline} onChange={handleChange} className={inputClasses}/>
                      </div>
                      <div>
                          <label htmlFor="estimatedHours" className={labelClasses}>Estimated Hours</label>
                           <input type="number" name="estimatedHours" id="estimatedHours" min="0" value={formData.estimatedHours} onChange={handleChange} className={inputClasses}/>
                      </div>
                  </div>

                  <div>
                      <label htmlFor="maxBidders" className={labelClasses}>Max Proposals Allowed</label>
                      <input type="number" name="maxBidders" id="maxBidders" min="1" max="20" required value={formData.maxBidders} onChange={handleChange} className={`${inputClasses} text-center`}/>
                      <p className="text-xs text-white/40 mt-1">Bidding closes automatically once this many proposals are received.</p>
                  </div>

                  <div>
                      <label className={labelClasses}>Required Skills</label>
                      <div className="mt-1 flex gap-x-2">
                          <input type="text" value={skillsInput} onChange={(e) => setSkillsInput(e.target.value)} placeholder="e.g., React, Node.js" className={inputClasses}/>
                          <button type="button" onClick={handleAddSkill} className="rounded bg-primary/20 border border-primary/40 px-4 text-sm font-semibold font-nav text-primary shadow-sm hover:bg-primary/30 whitespace-nowrap transition-all duration-300 uppercase tracking-wider">Add</button>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                          {skills.map(skill => (
                              <span key={skill} className="inline-flex items-center gap-x-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                                  {skill}
                                  <button type="button" onClick={() => handleRemoveSkill(skill)} className="h-5 w-5 flex items-center justify-center rounded-full text-primary/60 hover:text-primary hover:bg-primary/20 transition-all">
                                      <X className="h-3 w-3" />
                                  </button>
                              </span>
                          ))}
                      </div>
                  </div>
                  
                  <div className="pt-5">
                      <button type="submit" className="w-full flex justify-center py-3 px-4 rounded shadow-sm font-semibold font-nav text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-300 uppercase tracking-wider">
                        Create Task
                      </button>
                  </div>
                </form>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
               <div className="card">
                  <h3 className="text-lg font-heading font-bold text-white mb-4">Tips for a Great Task</h3>
                   <ul className="space-y-4 text-sm text-white/60">
                      <li className="flex items-start gap-3">
                          <Check className="h-4 w-4 text-primary flex-shrink-0" />
                          <span>Be specific about what you need and what the final deliverable should look like.</span>
                      </li>
                       <li className="flex items-start gap-3">
                          <Check className="h-4 w-4 text-primary flex-shrink-0" />
                          <span>Set a realistic credit amount based on the complexity and time required.</span>
                      </li>
                       <li className="flex items-start gap-3">
                          <Check className="h-4 w-4 text-primary flex-shrink-0" />
                          <span>List all the skills required for someone to successfully complete the task.</span>
                      </li>
                       <li className="flex items-start gap-3">
                          <Check className="h-4 w-4 text-primary flex-shrink-0" />
                          <span>Be responsive to questions from potential task claimers.</span>
                      </li>
                  </ul>
              </div>
              <div className="card">
                  <h3 className="text-lg font-heading font-bold text-white mb-4">Need Help?</h3>
                  <p className="text-sm text-white/60 mb-4">If you have questions about creating tasks or how the platform works, check out our help center or contact support.</p>
                  <Link to="/help-center" className="text-sm font-semibold text-primary hover:text-primary-dark transition-colors">Go to Help Center &rarr;</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CreateTask; 