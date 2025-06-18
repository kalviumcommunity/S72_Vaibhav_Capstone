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