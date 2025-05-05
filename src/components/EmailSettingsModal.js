import React, { useState } from 'react';

function EmailSettingsModal({ isOpen, onClose, onSave }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(email, password);
    setEmail('');
    setPassword('');
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Email Settings</h2>
        <label>
          Enter Email ID:
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
          />
        </label>
        <label>
          Enter Password:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="password"
          />
        </label>
        <div className="modal-buttons">
          <button onClick={handleSave}>Save</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default EmailSettingsModal;