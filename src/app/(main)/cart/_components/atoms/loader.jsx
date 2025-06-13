import React from 'react';

const Loader = () => {
  return (
    <div className="loader-container">
      <div className="loader"></div>
    </div>
  );
};

// Example CSS (you can put this in your global styles or a separate CSS module)
const loaderStyles = `
  .loader-container {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .loader {
    border: 4px solid #f3f3f3; /* Light grey border */
    border-top: 4px solid #3498db; /* Blue border for the spinner */
    border-radius: 50%;
    width: 30px;
    height: 30px;
    animation: spin 2s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// You might want to inject these styles or use a CSS module
const injectStyles = () => {
  const style = document.createElement('style');
  style.textContent = loaderStyles;
  document.head.appendChild(style);
};

// Inject styles when the component is first used (optional)
if (typeof document !== 'undefined') {
  injectStyles();
}

export default Loader;