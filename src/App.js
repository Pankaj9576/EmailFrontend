import React, { useState } from 'react';
import EmailSettingsModal from './components/EmailSettingsModal';
import ToastNotification from './components/ToastNotification';
import './App.css';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [activeTab, setActiveTab] = useState('send-emails');
  const [selectedFile, setSelectedFile] = useState(null);
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(0);
  const [totalCompanies, setTotalCompanies] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [emailTasks, setEmailTasks] = useState([]);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);

  const handleOpenModal = () => {
    console.log('Opening Email Settings Modal');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    console.log('Closing Email Settings Modal');
    setIsModalOpen(false);
  };

  const handleSaveSettings = () => {
    // No longer needed since email and password are not required
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
        const errorData = await response.text();
        throw new Error(errorData || `HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      setTotalCompanies(result.total_companies);
      setToastMessage(`Processed ${result.total_companies} companies`);
    } catch (error) {
      console.error('Upload error:', error);
      setTotalCompanies(null);
      setToastMessage(`Upload failed: ${error.message}`);
      console.log('Error details:', {
        message: error.message,
        stack: error.stack,
        response: error.response ? error.response : 'No response data',
      });
    }
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleGenerateEmails = async () => {
    console.log('Generate Emails button clicked');
    if (isSending) {
      setToastMessage('Email processing is already in progress. Please wait.');
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
    setCurrentTaskIndex(0);
    setToastMessage('Generating emails, please wait...');
    setShowToast(true);

    try {
      const response = await fetch('https://email-backend-beta-two.vercel.app/api/generate-emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ startIndex, endIndex }),
      });

      console.log(`Response status: ${response.status}`);
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || `HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      console.log('Backend response:', result);
      setToastMessage(result.message);
      if (result.email_tasks && result.email_tasks.length > 0) {
        console.log('Setting email tasks:', result.email_tasks);
        setEmailTasks(result.email_tasks);
        setTimeout(() => processNextEmail(), 0); // Ensure state is updated before calling
      } else {
        console.log('No email tasks returned from backend');
        setToastMessage('No emails to process. Check the data or index range.');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
        setIsSending(false);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setToastMessage(`Error generating emails: ${error.message}`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      setIsSending(false);
    }
  };

  const processNextEmail = () => {
    console.log(`Current task index: ${currentTaskIndex}, Total tasks: ${emailTasks.length}`);
    if (currentTaskIndex >= emailTasks.length) {
      console.log('Finished processing all email tasks');
      setToastMessage('Finished processing all emails');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      setIsSending(false);
      return;
    }

    const task = emailTasks[currentTaskIndex];
    console.log(`Processing email for ${task.company}, Status: ${task.status}, Mailto link: ${task.mailto_link}`);

    if (task.status === 'skipped') {
      console.log(`Skipping ${task.company}: ${task.reason}`);
      setToastMessage(`Skipped ${task.company}: ${task.reason}`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      setCurrentTaskIndex(currentTaskIndex + 1);
      setTimeout(processNextEmail, 2000); // Short delay for skipped tasks
      return;
    }

    // Attempt to open the mailto link
    try {
      console.log(`Attempting to open mailto link: ${task.mailto_link}`);
      const opened = window.open(task.mailto_link, '_blank');
      if (opened) {
        console.log(`Successfully opened mailto link for ${task.company}`);
        setToastMessage(`Opened email for ${task.company} (${task.recipients.join(', ')}). Please send the email from your email client.`);
      } else {
        console.warn(`Failed to open mailto link for ${task.company}. Browser may have blocked the popup.`);
        setToastMessage(`Could not open email for ${task.company}. Please allow popups or manually open this link: ${task.mailto_link}`);
      }
    } catch (error) {
      console.error(`Error opening mailto link for ${task.company}:`, error);
      setToastMessage(`Error opening email for ${task.company}. Please manually open this link: ${task.mailto_link}`);
    }
    setShowToast(true);
    setTimeout(() => setShowToast(false), 5000);

    // Wait 2 minutes before processing the next email
    setTimeout(() => {
      setCurrentTaskIndex(currentTaskIndex + 1);
      processNextEmail();
    }, 120000); // 2 minutes in milliseconds
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
              onClick={handleGenerateEmails}
              disabled={isSending}
              style={{ opacity: isSending ? 0.6 : 1, cursor: isSending ? 'not-allowed' : 'pointer' }}
            >
              {isSending ? 'Processing Emails...' : (
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