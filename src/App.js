import React, { useState } from 'react';
import './App.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [file, setFile] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [startIndex, setStartIndex] = useState('');
  const [endIndex, setEndIndex] = useState('');

  const onChange = async (e) => {
    e.preventDefault();
    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('https://email-backend-beta-two.vercel.app/api/upload-excel', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const result = await response.json();
      toast.success(`Processed ${result.total_companies} companies`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload file');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('https://email-backend-beta-two.vercel.app/api/send-emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          startIndex: parseInt(startIndex),
          endIndex: parseInt(endIndex),
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const result = await response.json();
      toast.success(result.message);
    } catch (error) {
      console.error('Send email error:', error);
      toast.error('Failed to send emails');
    }
  };

  return (
    <div className="App">
      <h1>Email Sender</h1>
      <div>
        <h2>Upload Excel File</h2>
        <input type="file" accept=".xlsx, .xls" onChange={onChange} />
      </div>
      <div>
        <h2>Send Emails</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Start Index:</label>
            <input
              type="number"
              value={startIndex}
              onChange={(e) => setStartIndex(e.target.value)}
              required
            />
          </div>
          <div>
            <label>End Index:</label>
            <input
              type="number"
              value={endIndex}
              onChange={(e) => setEndIndex(e.target.value)}
              required
            />
          </div>
          <button type="submit">Send Emails</button>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
}

export default App;