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