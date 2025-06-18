const handleDeleteTask = async (taskId) => {
  if (!window.confirm('Are you sure you want to delete this task?')) {
    return;
  }
  try {
    const response = await axios.delete(`${API_URL}/api/tasks/${taskId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.data.success) {
      fetchTasks(); // Refresh the task list
      alert('Task deleted successfully!');
    } else {
      alert(response.data.message || 'Failed to delete task.');
    }
  } catch (error) {
    console.error('Error deleting task:', error);
    alert(error.response?.data?.message || 'Failed to delete task.');
  }
};