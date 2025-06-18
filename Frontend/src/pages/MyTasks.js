const handleUpdateTask = (taskId) => {
  navigate(`/edit-task/${taskId}`);
};

const handleDeleteTask = async (taskId) => {
  if (!window.confirm("Are you sure you want to delete this task? This action cannot be undone.")) {
    return;
  }

  if (!user || !token) {
    alert('You must be logged in to delete a task.');
    return;
  }

  try {
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    };
    await axios.delete(`${API_URL}/api/tasks/${taskId}`, config);
    alert('Task deleted successfully!');
    fetchTasks(); // Refresh tasks after deletion
  } catch (err) {
    console.error('Error deleting task:', err.response?.data?.message || err.message);
    alert(`Failed to delete task: ${err.response?.data?.message || err.message}`);
  }
};