const handleFileDownload = async (filename) => {
  try {
    const response = await axios.get(`/api/tasks/${taskId}/files/${filename}`, {
      responseType: 'blob',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (err) {
    console.error('Error downloading file:', err);
    setError('Failed to download file.');
  }
};

const handleDeleteTask = async () => {
  if (!window.confirm("Are you sure you want to delete this task? This action cannot be undone.")) {
    return;
  }

  if (!user || !token) {
    alert('You must be logged in to delete a task.');
    return;
  }
  if (task.creator?._id !== user._id) {
    alert('You are not authorized to delete this task.');
    return;
  }
  try {
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    };
    await axios.delete(`/tasks/${id}`, config);
    alert('Task deleted successfully!');
    navigate('/mytasks'); // Redirect after deletion
  } catch (err) {
    console.error('Error deleting task:', err.response?.data?.message || err.message);
    alert(`Failed to delete task: ${err.response?.data?.message || err.message}`);
  }
};