import React, { useState } from 'react';
import EmailSettingsModal from './components/EmailSettingsModal';
import ToastNotification from './components/ToastNotification';
import './App.css';

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [activeTab, setActiveTab] = useState('send-emails');
  const [selectedFile, setSelectedFile] = useState(null);
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(0);
  const [totalCompanies, setTotalCompanies] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [emailFormat, setEmailFormat] = useState('General Email');
  const [companiesList, setCompaniesList] = useState([]);

  const handleOpenModal = () => {
    console.log('Opening Email Settings Modal');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    console.log('Closing Email Settings Modal');
    setIsModalOpen(false);
  };

  const handleOpenPreviewModal = () => {
    console.log('Opening Email Preview Modal');
    setIsPreviewModalOpen(true);
  };

  const handleClosePreviewModal = () => {
    console.log('Closing Email Preview Modal');
    setIsPreviewModalOpen(false);
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
      setTimeout(() => setShowToast(false), 4000);
      return;
    }

    setSelectedFile(file);
    setToastMessage(`File selected: ${file.name}`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);

    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await fetch('https://email-backend-beta-two.vercel.app/api/upload-excel', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      setTotalCompanies(result.total_companies);
      setToastMessage(`Processed ${result.total_companies} companies`);
      fetchCompanies();
    } catch (error) {
      console.error('Upload error:', error);
      setTotalCompanies(null);
      setToastMessage(`Upload failed: ${error.message}`);
    }
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  };

  const fetchCompanies = async () => {
    try {
      const response = await fetch('https://email-backend-beta-two.vercel.app/api/get-companies', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      setCompaniesList(result.companies);
    } catch (error) {
      console.error('Fetch companies error:', error);
      setToastMessage(`Error fetching companies: ${error.message}`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
    }
  };

  const handleSendEmails = async () => {
    console.log('Send Emails button clicked');
    if (isSending) {
      setToastMessage('Email processing is already in progress. Please wait.');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
      return;
    }

    if (!email || !password) {
      setToastMessage('Please configure email settings first.');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
      return;
    }

    if (!selectedFile) {
      setToastMessage('Please upload an Excel file first.');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
      return;
    }

    if (totalCompanies === null) {
      setToastMessage('No companies processed. Please upload a valid Excel file.');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
      return;
    }

    if (startIndex < 0 || endIndex >= totalCompanies || startIndex > endIndex) {
      setToastMessage('Invalid index range. Please check Start Index and End Index.');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
      return;
    }

    setIsSending(true);
    setToastMessage('Sending emails, please wait...');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);

    try {
      const response = await fetch('https://email-backend-beta-two.vercel.app/api/send-emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, startIndex, endIndex, emailFormat }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      console.log('Backend response:', result);
      setToastMessage(result.message);
      setTimeout(() => {
        window.location.reload();
      }, 4000);
    } catch (error) {
      console.error('Fetch error:', error);
      setToastMessage(`Error sending emails: ${error.message}`);
    } finally {
      setIsSending(false);
    }

    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  };

  const getEmailPreviewContent = () => {
    const names_list = '[Recipient Names]';
    const patents_str = '[Patent Numbers]';
    if (emailFormat === 'Meeting Email') {
      return `
        <html>
        <body>
        <p style="font-size: 10.5pt;">
            Hi ${names_list},<br><br>
            Hope this email finds you well.<br><br>
            We have identified patents ${patents_str} etc. as potential candidates for monetization and believe there is a significant opportunity for your organization.<br><br>
            We would love to schedule a meeting to discuss this further and explore how we can collaborate with your team. Please let us know a convenient time for a call or virtual meeting.<br><br>
            Feel free to suggest a date and time, or you can book a slot directly via our calendar: <a href="https://calendly.com/bayslope/meeting">Schedule a Meeting</a>.<br><br>
            Looking forward to your response.<br><br>
            Best regards,<br>
            Sarita (Sara) / Bayslope<br>
            Techreport99 | Bayslope<br>
            e: <a href="mailto:patents@bayslope.com">patents@bayslope.com</a><br>
            p: +91-9811967160 (IN), +1 650 353 7723 (US), +44 1392 58 1535 (UK)<br><br>
            <span style="color: grey; font-size: 8.5pt;">
                The content of this email message and any attachments are intended solely for the addressee(s) and may contain confidential and/or privileged information...
            </span>
        </p>
        </body>
        </html>
      `;
    } else {
      return `
        <html>
        <body>
        <p style="font-size: 10.5pt;">
            Hi ${names_list},<br><br>
            Hope all is well at your end.<br><br>
            Our internal framework has identified patents ${patents_str} etc. and we think there is a monetization opportunity for them.<br><br>
            We work closely with a network of active buyers who regularly acquire high-quality patents for monetization across various technology sectors.<br><br>
            Could you help facilitate a discussion with your client about this matter?<br><br>
            Best regards,<br>
            Sarita (Sara) / Bayslope<br>
            Techreport99 | Bayslope<br>
            e: <a href="mailto:patents@bayslope.com">patents@bayslope.com</a><br>
            p: +91-9811967160 (IN), +1 650 353 7723 (US), +44 1392 58 1535 (UK)<br><br>
            <span style="color: grey; font-size: 8.5pt;">
                The content of this email message and any attachments are intended solely for the addressee(s) and may contain confidential and/or privileged information...
            </span>
        </p>
        </body>
        </html>
      `;
    }
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
          <button
            className={activeTab === 'available-companies' ? 'active' : ''}
            onClick={() => {
              console.log('Switching to Available Companies tab');
              setActiveTab('available-companies');
              if (totalCompanies !== null) fetchCompanies();
            }}
          >
            Available Companies
          </button>
          <button
            className={activeTab === 'email-settings' ? 'active' : 'email-settings-btn'}
            onClick={() => {
              console.log('Switching to Email Settings tab');
              setActiveTab('email-settings');
              handleOpenModal();
            }}
          >
            Email Settings
          </button>
        </div>
        {activeTab === 'send-emails' && (
          <div className="form">
            <div className="form-group">
              <label className="first">Select Excel File</label>
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
            <div className="form-group email-format-group">
              <label>Select Email Format</label>
              <div className="email-format-container">
                <select
                  value={emailFormat}
                  onChange={(e) => setEmailFormat(e.target.value)}
                >
                  <option value="General Email">General Email</option>
                  <option value="Meeting Email">Meeting Email</option>
                </select>
                <button className="preview-btn" onClick={handleOpenPreviewModal}>
                  Preview
                </button>
              </div>
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
        {activeTab === 'available-companies' && (
          <div className="companies-table">
            <h3>Available Companies</h3>
            {companiesList.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Index</th>
                    <th>Company Name</th>
                  </tr>
                </thead>
                <tbody>
                  {companiesList.map((company, index) => (
                    <tr key={index}>
                      <td>{index}</td>
                      <td>{company}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No companies available. Please upload an Excel file first.</p>
            )}
          </div>
        )}
      </main>
      <EmailSettingsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveSettings}
      />
      {isPreviewModalOpen && (
        <div className="modal">
          <div className="modal-content preview-modal">
            <h2>Email Preview - {emailFormat}</h2>
            <div className="email-preview-content" dangerouslySetInnerHTML={{ __html: getEmailPreviewContent() }} />
            <div className="modal-buttons">
            <button onClick={handleClosePreviewModal} style={{backgroundColor:'green'}}>Save</button>
              <button onClick={handleClosePreviewModal} style={{backgroundColor:'red'}}>Close</button>
            </div>
          </div>
        </div>
      )}
      <ToastNotification message={toastMessage} isVisible={showToast} />
      <footer>
        <p>© 2025 Bayslope Business Solutions</p>
      </footer>
    </div>
  );
}

export default App;