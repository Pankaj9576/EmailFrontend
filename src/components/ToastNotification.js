import React from 'react';

function ToastNotification({ message, isVisible }) {
  if (!isVisible) return null;

  return (
    <div className="toast">
      {message}
    </div>
  );
}

export default ToastNotification;