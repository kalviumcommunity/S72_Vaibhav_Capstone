import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import { io } from 'socket.io-client';
import Layout from '../components/Layout';

const SOCKET_URL =  'https://s72-vaibhav-capstone.onrender.com';

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
    socketRef.current = io(SOCKET_URL);
    socketRef.current.emit('joinTaskRoom', id);
    socketRef.current.on('receiveMessage', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });
    return () => {
      socketRef.current.disconnect();
    };
  }, [id]);

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
    if (!avatarPath) return `https://ui-avatars.com/api/?name=?&background=random`;
    return avatarPath.startsWith('http') ? avatarPath : `${API_URL}/${avatarPath}`;
  };

  const renderTaskStatus = (status) => {
    const baseClasses = "px-3 py-1 text-xs font-semibold rounded-full inline-block";
    const statusMap = {
        available: "bg-green-100 text-green-800",
        claimed: "bg-yellow-100 text-yellow-800",
        submitted: "bg-blue-100 text-blue-800",
        completed: "bg-purple-100 text-purple-800",
        rejected: "bg-red-100 text-red-800"
    };
    return <span className={`${baseClasses} ${statusMap[status] || 'bg-gray-100 text-gray-800'}`}>{status}</span>;
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

  if (loading) return <div className="text-center py-20">Loading...</div>;
  if (error) return <div className="text-center py-20 text-red-500">{error}</div>;
  if (!task) return <div className="text-center py-20">Task not found.</div>;

  const isCreator = user?._id === task.creator._id;
  const isClaimant = user?._id === task.claimant?._id;

  return (
    <Layout>
      <div className="bg-white min-h-screen">
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="bg-white shadow-xl rounded-2xl p-8 mb-8 border border-black">
            <div className="flex justify-between items-start">
              <div>
                {renderTaskStatus(task.status)}
                <h1 className="text-3xl font-extrabold text-black mt-2">{task.title}</h1>
                <div className="mt-2 flex items-center gap-3">
                  <img src={getAvatarUrl(task.creator.avatar)} alt={task.creator.name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{task.creator.name}</p>
                    <p className="text-xs text-gray-500">Posted on {new Date(task.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-black">{task.credits}</p>
                <p className="text-sm text-gray-700">CREDITS</p>
              </div>
            </div>
            <div className="mt-6 border-t border-gray-200 pt-6 text-sm text-gray-600 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2"><p><strong>Category:</strong> {task.category}</p></div>
              <div className="flex items-center gap-2"><p><strong>Deadline:</strong> {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'N/A'}</p></div>
              <div className="flex items-center gap-2"><p><strong>Hours:</strong> ~{task.estimatedHours} hrs</p></div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-white shadow-xl rounded-2xl p-6 mb-8 flex flex-wrap items-center justify-center gap-4">
            {isCreator && (
              <>
                <Link to={`/tasks/update/${id}`} className="btn-action bg-blue-600 hover:bg-blue-700">Update Task</Link>
                <button onClick={() => handleAction('delete')} className="btn-action bg-red-600 hover:bg-red-700">Delete Task</button>
                {task.status === 'submitted' && (
                  <>
                    <button onClick={() => handleAction('approve')} className="btn-action bg-green-600 hover:bg-green-700">Approve Submission</button>
                    <button onClick={() => handleAction('reject')} className="btn-action bg-yellow-600 hover:bg-yellow-700">Request Changes</button>
                  </>
                )}
              </>
            )}
            {task.status === 'available' && !isCreator && (
              <button onClick={() => handleAction('claim')} className="btn-action bg-indigo-600 hover:bg-indigo-700">Claim Task</button>
            )}
          </div>

          {/* Task Details & Skills */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <div className="lg:col-span-2 bg-white shadow-xl rounded-2xl p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Task Description</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{task.description}</p>
            </div>
            <div className="bg-white shadow-xl rounded-2xl p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Required Skills</h2>
              <div className="flex flex-wrap gap-2">
                {task.skills.map(skill => (
                  <span key={skill} className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">{skill}</span>
                ))}
              </div>
            </div>
          </div>
          
          {/* Submission Section */}
          {isClaimant && ['claimed', 'rejected'].includes(task.status) && (
            <div className="bg-white shadow-xl rounded-2xl p-8 mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Submit Your Work</h2>
              {submitMessage && <p className="text-green-600 mb-4">{submitMessage}</p>}
              {submitError && <p className="text-red-600 mb-4">{submitError}</p>}
              <form onSubmit={handleSubmission} className="space-y-4">
                <div>
                  <label htmlFor="submissionContent" className="block text-sm font-medium text-gray-700">Notes / Comments</label>
                  <textarea id="submissionContent" value={submissionContent} onChange={e => setSubmissionContent(e.target.value)} rows="4" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"></textarea>
                </div>
                <div>
                  <label htmlFor="submissionFiles" className="block text-sm font-medium text-gray-700">Attach Files</label>
                  <input id="submissionFiles" type="file" multiple onChange={e => setSubmissionFiles(Array.from(e.target.files))} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"/>
                </div>
                <button type="submit" className="btn-action bg-green-600 hover:bg-green-700 w-full">Submit for Approval</button>
              </form>
            </div>
          )}
          
          {/* Submitted Work Viewer */}
          {task.submission && (isCreator || isClaimant) && (
            <div className="bg-white shadow-xl rounded-2xl p-8 mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Submitted Work</h2>
              <p className="text-gray-700 mb-4 whitespace-pre-wrap">{task.submission.content || "No text content submitted."}</p>
              {task.submission.files && task.submission.files.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Files:</h3>
                  <ul className="list-disc pl-5">
                    {task.submission.files.map(file => (
                      <li key={file.path}><a href={`${API_URL}/${file.path}`} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">{file.originalname}</a></li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </Layout>
  );
};

export default SingleTask;