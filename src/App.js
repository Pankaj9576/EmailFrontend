import React, { useState } from 'react';
import EmailSettingsModal from './components/EmailSettingsModal';
import ToastNotification from './components/ToastNotification';
import './App.css';

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [activeTab, setActiveTab] = useState('send-emails');
  const [selectedFile, setSelectedFile] = useState(null);
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(0);
  const [totalCompanies, setTotalCompanies] = useState(null);
  const [isSending, setIsSending] = useState(false);

  const handleOpenModal = () => {
    console.log('Opening Email Settings Modal');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    console.log('Closing Email Settings Modal');
    setIsModalOpen(false);
  };

  const handleSaveSettings = (newEmail, newPassword) => {
    setEmail(newEmail);
    setPassword(newPassword);
    handleCloseModal();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) {
      setToastMessage('No file selected. Please choose an Excel file.');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return;
    }

    setSelectedFile(file);
    setToastMessage(`File selected: ${file.name}`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);

    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await fetch('https://email-backend-beta-two.vercel.app/api/upload-excel', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        const errorData = await response.text(); // Use text() instead of json() to handle non-JSON responses
        throw new Error(errorData || `HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      setTotalCompanies(result.total_companies);
      setToastMessage(`Processed ${result.total_companies} companies`);
    } catch (error) {
      console.error('Upload error:', error);
      setTotalCompanies(null);
      setToastMessage(`Upload failed: ${error.message}`);
    }
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleSendEmails = async () => {
    console.log('Send Emails button clicked');
    if (isSending) {
      setToastMessage('Emails are already being sent. Please wait.');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return;
    }

    if (!email || !password) {
      setToastMessage('Please set your email and password in Email Settings.');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return;
    }

    if (!selectedFile) {
      setToastMessage('Please upload an Excel file first.');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return;
    }

    if (totalCompanies === null) {
      setToastMessage('No companies processed. Please upload a valid Excel file.');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return;
    }

    if (startIndex < 0 || endIndex >= totalCompanies || startIndex > endIndex) {
      setToastMessage('Invalid index range. Please check Start Index and End Index.');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return;
    }

    setIsSending(true);
    setToastMessage('Sending emails, please wait...');
    setShowToast(true);

    try {
      const response = await fetch('https://email-backend-beta-two.vercel.app/api/send-emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, startIndex, endIndex }),
      });

      console.log(`Response status: ${response.status}`);
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || `HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      setToastMessage(result.message);
    } catch (error) {
      console.error('Fetch error:', error);
      setToastMessage(`Error sending emails: ${error.message}`);
    } finally {
      setIsSending(false);
    }

    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="App">
      <header className="App-header">
        <svg className="email-logo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
          <polyline points="22,6 12,13 2,6"></polyline>
        </svg>
        <h1>Bayslope Email Sender</h1>
        <p>Send patent monetization emails to multiple companies</p>
      </header>
      <main>
        <div className="tabs">
          <button
            className={activeTab === 'send-emails' ? 'active' : ''}
            onClick={() => {
              console.log('Switching to Send Emails tab');
              setActiveTab('send-emails');
            }}
          >
            Send Emails
          </button>
          <button className="email-settings-btn" onClick={handleOpenModal}>
            Email Settings
          </button>
        </div>
        {activeTab === 'send-emails' && (
          <div className="form">
            <div className="form-group">
              <label className='first'>Select Excel File</label>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                style={{ display: 'none' }}
                id="file-input"
              />
              <label htmlFor="file-input" className="choose-file-btn">
                Choose Excel File
              </label>
              {selectedFile && <p>Selected: {selectedFile.name}</p>}
              {totalCompanies !== null && <p>Total Companies: {totalCompanies}</p>}
            </div>
            <div className="form-group">
              <label>Select Email Format</label>
              <select>
                <option>General Email</option>
              </select>
            </div>
            <div className="form-group inline">
              <div>
                <label>Start Index</label>
                <input
                  type="number"
                  value={startIndex}
                  onChange={(e) => setStartIndex(Number(e.target.value))}
                />
              </div>
              <div>
                <label>End Index</label>
                <input
                  type="number"
                  value={endIndex}
                  onChange={(e) => setEndIndex(Number(e.target.value))}
                />
              </div>
            </div>
            <button
              className="send-btn"
              onClick={handleSendEmails}
              disabled={isSending}
              style={{ opacity: isSending ? 0.6 : 1, cursor: isSending ? 'not-allowed' : 'pointer' }}
            >
              {isSending ? 'Sending Emails...' : (
                <>
                  <svg className="send-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                  Send Emails
                </>
              )}
            </button>
          </div>
        )}
      </main>
      <EmailSettingsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveSettings}
      />
      <ToastNotification message={toastMessage} isVisible={showToast} />
      <footer>
        <p>© 2025 Bayslope Business Solutions</p>
      </footer>
    </div>
  );
}

export default App;