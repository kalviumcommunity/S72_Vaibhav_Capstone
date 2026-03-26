import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import { io } from 'socket.io-client';
import Layout from '../components/Layout';
import { CheckCircle } from 'lucide-react';

const SOCKET_URL = API_URL;

const SingleTask = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submissionContent, setSubmissionContent] = useState('');
  const [submissionFiles, setSubmissionFiles] = useState([]);
  const [submitMessage, setSubmitMessage] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [bidMessage, setBidMessage] = useState('');
  const [bidCredits, setBidCredits] = useState('');
  const [bidDays, setBidDays] = useState('');
  const [bidError, setBidError] = useState(null);
  const [bidSuccess, setBidSuccess] = useState(false);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const socketRef = useRef();
  const chatEndRef = useRef();

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/tasks/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTask(response.data.task);
      } catch (err) {
        setError('Failed to load task.');
      } finally {
        setLoading(false);
      }
    };
    fetchTask();
  }, [id, token]);

  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;
    socket.on('connect', () => {
      socket.emit('joinTaskRoom', id);
    });
    socket.on('receiveMessage', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });
    return () => {
      socket.disconnect();
    };
  }, [id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleAction = async (action, payload = {}) => {
    if (!window.confirm(`Are you sure you want to ${action.replace('-', ' ')} this task?`)) return;

    try {
      const config = { headers: { 'Authorization': `Bearer ${token}` } };
      let response;

      switch (action) {
        case 'claim':
          response = await axios.put(`${API_URL}/api/tasks/${id}/claim`, payload, config);
          break;
        case 'approve':
          response = await axios.put(`${API_URL}/api/tasks/${id}/approve`, payload, config);
          break;
        case 'reject':
          const reason = prompt("Please provide a reason for rejecting the task:");
          if (!reason) return;
          response = await axios.put(`${API_URL}/api/tasks/${id}/reject`, { ...payload, reason }, config);
          break;
        case 'delete':
          response = await axios.delete(`${API_URL}/api/tasks/${id}`, config);
          navigate('/tasks');
          return;
        default:
          return;
      }
      
      setTask(response.data.task);
      alert(`Task ${action.replace('-', ' ')}ed successfully!`);

    } catch (err) {
      alert(`Failed to ${action.replace('-', ' ')} task: ${err.response?.data?.message || err.message}`);
    }
  };

  const handlePlaceBid = async (e) => {
    e.preventDefault();
    setBidError(null);
    try {
      const response = await axios.post(
        `${API_URL}/api/tasks/${id}/bid`,
        { message: bidMessage, credits: Number(bidCredits) || 0, days: Number(bidDays) || 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTask(response.data.task);
      setBidSuccess(true);
      setBidMessage('');
      setBidCredits('');
      setBidDays('');
    } catch (err) {
      setBidError(err.response?.data?.message || 'Failed to place bid.');
    }
  };

  const handleSelectBidder = async (bidderId) => {
    if (!window.confirm('Select this bidder and assign the task to them?')) return;
    try {
      const response = await axios.put(
        `${API_URL}/api/tasks/${id}/select-bidder`,
        { bidderId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTask(response.data.task);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to select bidder.');
    }
  };

  const handleSubmission = async (e) => {
    e.preventDefault();
    setSubmitMessage(null);
    setSubmitError(null);

    const formData = new FormData();
    formData.append('content', submissionContent);
    submissionFiles.forEach(file => formData.append('files', file));

    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
        },
      };

      const response = await axios.put(`${API_URL}/api/tasks/${id}/submit`, formData, config);
      setTask(response.data.task);
      setSubmitMessage('Submission successful!');
      setSubmissionContent('');
      setSubmissionFiles([]);

    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Failed to submit.');
    }
  };

  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return '/default-avatar.svg';
    return avatarPath.startsWith('http') ? avatarPath : `${API_URL}/${avatarPath}`;
  };

  const renderTaskStatus = (status) => {
    const baseClasses = "px-3 py-1 text-xs font-semibold font-nav rounded uppercase tracking-wider inline-block";
    const statusMap = {
        'open':        'status-open',
        'bidding':     'status-open',
        'assigned':    'status-claimed',
        'in-progress': 'status-claimed',
        'submitted':   'status-submitted',
        'completed':   'status-completed',
        'rejected':    'status-rejected',
        'cancelled':   'status-rejected',
    };
    return <span className={`${baseClasses} ${statusMap[status] || 'bg-white/10 text-white/60'}`}>{status}</span>;
  };

  const handleFileDownload = async (fileUrl) => {
    try {
      const response = await axios.get(fileUrl, {
        responseType: 'blob',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const contentType = response.headers['content-type'];
      const isImage = contentType.startsWith('image/');
      
      if (isImage) {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        window.open(url, '_blank');
      } else {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileUrl.split('/').pop());
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
    } catch (err) {
      console.error('Error downloading file:', err);
      alert('Failed to download file');
    }
  };

  const isImageFile = (filename) => {
    const ext = filename.toLowerCase().split('.').pop();
    return ['jpg', 'jpeg', 'png'].includes(ext);
  };

  const getImagePreviewUrl = (filename) => {
    return `${API_URL}/api/tasks/${id}/files/${filename}`;
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (chatInput.trim() && socketRef.current) {
      const message = {
        taskId: id,
        userId: user._id,
        userName: user.name,
        content: chatInput,
        timestamp: new Date().toISOString(),
      };
      socketRef.current.emit('sendMessage', message);
      setChatInput('');
    }
  };

  if (loading) return (
    <Layout>
      <div className="text-center py-20">
        <div className="w-12 h-12 border-4 border-white/10 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-white/50">Loading task...</p>
      </div>
    </Layout>
  );
  if (error) return <Layout><div className="text-center py-20 text-red-400">{error}</div></Layout>;
  if (!task) return <Layout><div className="text-center py-20 text-white/50">Task not found.</div></Layout>;

  const isCreator = user?._id?.toString() === task.creator?._id?.toString() ||
                    user?._id?.toString() === task.creator?.toString();
  const isClaimant = user?._id?.toString() === task.claimant?._id?.toString() ||
                     user?._id?.toString() === task.claimant?.toString();

  return (
    <Layout>
      <div className="min-h-screen bg-dark">
        <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          {/* Header Card */}
          <div className="card mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
              <div>
                {renderTaskStatus(task.status)}
                <h1 className="text-3xl font-heading font-bold text-white mt-3">{task.title}</h1>
                <div className="mt-3 flex items-center gap-3">
                  <img src={getAvatarUrl(task.creator.avatar)} alt={task.creator.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/30" />
                  <div>
                    <p className="text-sm font-semibold text-white">{task.creator.name}</p>
                    <p className="text-xs text-white/40">Posted on {new Date(task.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-heading font-bold text-primary">{task.credits}</p>
                <p className="text-xs font-nav font-semibold text-white/40 uppercase tracking-wider">Credits</p>
              </div>
            </div>
            <div className="mt-6 border-t border-white/10 pt-6 text-sm text-white/55 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div><span className="font-semibold text-white/80">Category:</span> {task.category}</div>
              <div><span className="font-semibold text-white/80">Deadline:</span> {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'N/A'}</div>
              <div><span className="font-semibold text-white/80">Hours:</span> ~{task.estimatedHours} hrs</div>
              {(task.status === 'open' || task.status === 'bidding') && task.maxBidders && (
                <div>
                  <span className="font-semibold text-white/80">Proposals:</span>{' '}
                  <span className={task.bids?.length >= task.maxBidders ? 'text-red-400' : 'text-primary'}>
                    {task.bids?.length || 0}/{task.maxBidders}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Main Content + Chat Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Main Content (2/3) */}
            <div className="lg:col-span-2 flex flex-col gap-8">
              {/* Action Buttons */}
              <div className="card flex flex-wrap items-center justify-center gap-3">
                {isCreator && (task.status === 'open' || task.status === 'bidding') && !task.claimant && (
                  <button onClick={() => handleAction('delete')} className="btn-action bg-red-600 hover:bg-red-700">Delete Task</button>
                )}
                {isCreator && (
                  <Link to={`/edit-task/${id}`} className="btn-action bg-white/10 hover:bg-white/20 text-white">Update Task</Link>
                )}
                {isCreator && task.status === 'submitted' && (
                  <>
                    <button onClick={() => handleAction('approve')} className="btn-action bg-green-600 hover:bg-green-700">Approve Submission</button>
                    <button onClick={() => handleAction('reject')} className="btn-action bg-yellow-600 hover:bg-yellow-700">Request Changes</button>
                  </>
                )}
                {(task.status === 'open' || task.status === 'bidding') && !isCreator && user && (
                  (() => {
                    const userHasBid = task.bids?.some(
                      b => (b.bidder?._id || b.bidder)?.toString() === user._id?.toString()
                    );
                    return userHasBid || bidSuccess ? (
                      <span className="text-green-400 font-semibold text-sm flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" /> Proposal submitted
                      </span>
                    ) : (
                      <form onSubmit={handlePlaceBid} className="flex flex-col gap-2 w-full">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs text-white/50 mb-1">Your credit ask</label>
                            <input
                              type="number"
                              value={bidCredits}
                              onChange={e => setBidCredits(e.target.value)}
                              placeholder="Credits"
                              min="1"
                              className="input text-sm"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-white/50 mb-1">Days to complete</label>
                            <input
                              type="number"
                              value={bidDays}
                              onChange={e => setBidDays(e.target.value)}
                              placeholder="Days"
                              min="1"
                              className="input text-sm"
                              required
                            />
                          </div>
                        </div>
                        <textarea
                          value={bidMessage}
                          onChange={e => setBidMessage(e.target.value)}
                          placeholder="Describe your approach and why you're the right fit..."
                          rows={2}
                          className="input resize-none text-sm"
                        />
                        {bidError && <p className="text-red-400 text-xs">{bidError}</p>}
                        <button type="submit" className="btn-action">Submit Proposal</button>
                      </form>
                    );
                  })()
                )}
              </div>

              {/* Bids Panel — creator sees bids when task is open */}
              {isCreator && (task.status === 'open' || task.status === 'bidding') && task.bids && task.bids.length > 0 && (
                <div className="card">
                  <h2 className="text-lg font-heading font-bold text-white mb-4">Proposals ({task.bids.length})</h2>
                  <div className="space-y-4">
                    {task.bids.map((bid) => (
                      <div key={bid._id || bid.bidder?._id} className="flex items-start gap-4 p-4 bg-dark-lighter rounded-lg border border-white/10">
                        <img
                          src={getAvatarUrl(bid.bidder?.avatar)}
                          alt={bid.bidder?.name}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/30 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <p className="font-semibold text-white text-sm">{bid.bidder?.name}</p>
                            {bid.mlPrediction?.success_probability !== null && bid.mlPrediction?.success_probability !== undefined && (
                              <div className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                                bid.mlPrediction.success_probability >= 0.80 ? 'bg-green-500/20 text-green-300' :
                                bid.mlPrediction.success_probability >= 0.60 ? 'bg-yellow-500/20 text-yellow-300' :
                                'bg-red-500/20 text-red-300'
                              }`}>
                                {(bid.mlPrediction.success_probability * 100).toFixed(0)}% Success
                              </div>
                            )}
                          </div>
                          <div className="flex gap-4 mt-1 text-xs">
                            {bid.credits > 0 && <span className="text-primary font-semibold">{bid.credits} credits</span>}
                            {bid.days > 0 && <span className="text-white/50">{bid.days} day{bid.days !== 1 ? 's' : ''}</span>}
                          </div>
                          {bid.message && <p className="text-white/60 text-sm mt-1">{bid.message}</p>}
                          <p className="text-white/30 text-xs mt-1">{new Date(bid.createdAt).toLocaleDateString()}</p>
                          {bid.mlPrediction?.error && (
                            <p className="text-orange-300/60 text-xs mt-1 italic">⚠ AI score unavailable: {bid.mlPrediction.error}</p>
                          )}
                        </div>
                        <button
                          onClick={() => handleSelectBidder(bid.bidder?._id)}
                          className="btn-action flex-shrink-0 text-sm py-1.5 px-4"
                        >
                          Accept
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Task Details & Skills */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="card">
                  <h2 className="text-lg font-heading font-bold text-white mb-4">Task Description</h2>
                  <p className="text-white/60 whitespace-pre-wrap text-sm leading-relaxed">{task.description}</p>
                </div>
                <div className="card">
                  <h2 className="text-lg font-heading font-bold text-white mb-4">Required Skills</h2>
                  <div className="flex flex-wrap gap-2">
                    {task.skills && task.skills.length > 0 ? (
                      task.skills.map(skill => (
                        <span key={skill} className="bg-primary/15 text-primary border border-primary/25 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">{skill}</span>
                      ))
                    ) : (
                      <span className="text-white/40 text-sm">No skills listed.</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Submission Section */}
              {isClaimant && (
                <div className="card">
                  <h2 className="text-lg font-heading font-bold text-white mb-4">Submit Your Work</h2>
                  {submitMessage && <p className="text-green-400 mb-4 text-sm">{submitMessage}</p>}
                  {submitError && <p className="text-red-400 mb-4 text-sm">{submitError}</p>}
                  <form onSubmit={handleSubmission} className="space-y-4">
                    <div>
                      <label htmlFor="submissionContent" className="block text-sm font-medium text-white/70 mb-1">Notes / Comments</label>
                      <textarea id="submissionContent" value={submissionContent} onChange={e => setSubmissionContent(e.target.value)} rows="4" className="input resize-y"></textarea>
                    </div>
                    <div>
                      <label htmlFor="submissionFiles" className="block text-sm font-medium text-white/70 mb-1">Attach Files</label>
                      <input id="submissionFiles" type="file" multiple onChange={e => setSubmissionFiles(Array.from(e.target.files))} className="mt-1 block w-full text-sm text-white/50 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary/15 file:text-primary hover:file:bg-primary/25 transition-all"/>
                    </div>
                    <button type="submit" className="btn-action bg-green-600 hover:bg-green-700 w-full">Submit for Approval</button>
                  </form>
                </div>
              )}

              {/* Submitted Work Viewer */}
              {task.submission && (isCreator || isClaimant) && (
                <div className="card">
                  <h2 className="text-lg font-heading font-bold text-white mb-4">Submitted Work</h2>
                  <p className="text-white/60 mb-4 whitespace-pre-wrap text-sm">{task.submission.content || "No text content submitted."}</p>
                  {task.submission.files && task.submission.files.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-white/80 mb-2 text-sm">Files:</h3>
                      <ul className="list-disc pl-5">
                        {task.submission.files.map(file => (
                          <li key={file.path}><a href={`${API_URL}/${file.path}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-dark hover:underline text-sm">{file.originalname}</a></li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* AI Review Section */}
              {task.status === 'submitted' && isCreator && (
                <div className="card border border-primary/20">
                  <h2 className="text-lg font-heading font-bold text-white mb-2">AI Review</h2>
                  <p className="text-xs text-white/40 mb-4 italic">This review is only visible to you to help you make an informed decision.</p>
                  <div className="bg-dark-lighter rounded-lg p-4 border border-white/10">
                    <p className="text-white/60 whitespace-pre-wrap text-sm">{task.aiReview || 'AI review not available.'}</p>
                  </div>
                </div>
              )}

              {/* Rejection Reason */}
              {task.status === 'rejected' && isClaimant && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
                  <h2 className="text-lg font-heading font-bold text-red-400 mb-2">Why was your submission rejected?</h2>
                  <p className="text-red-300/80 text-sm">{task.rejectionReason || 'No reason provided.'}</p>
                </div>
              )}
            </div>

            {/* Chat Sidebar (1/3) */}
            {(isCreator || isClaimant) && (
              <div className="card flex flex-col h-full min-h-[400px]">
                <h2 className="text-lg font-heading font-bold text-white mb-4">Task Chat</h2>
                <div className="flex-1 h-64 overflow-y-auto border border-white/10 rounded-lg p-4 mb-4 bg-dark-lighter">
                  {messages.length === 0 ? (
                    <p className="text-white/40 text-sm">No messages yet.</p>
                  ) : (
                    messages.map((msg, idx) => (
                      <div key={idx} className={`mb-3 ${msg.userId === user._id ? 'text-right' : 'text-left'}`}>
                        <span className="font-semibold text-white/80 text-sm">{msg.userName}:</span>{' '}
                        <span className="text-white/60 text-sm">{msg.content}</span>
                        <span className="block text-xs text-white/30 mt-0.5">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                      </div>
                    ))
                  )}
                  <div ref={chatEndRef} />
                </div>
                <form onSubmit={sendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    className="input flex-grow text-sm"
                    placeholder="Type a message..."
                  />
                  <button type="submit" className="bg-primary text-white px-5 py-2.5 rounded font-semibold font-nav hover:bg-primary-dark transition-all duration-300 text-sm">Send</button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SingleTask;