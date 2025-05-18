import React from 'react';

export function GoogleSignInButton() {
  const handleClick = () => {
    const auth2 = window.gapi.auth2.getAuthInstance();
    auth2.signIn().catch(console.error);
  };

  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center px-4 py-2 border rounded hover:bg-gray-100"
    >
      {/* You can swap this SVG for your own logo asset */}
      <svg
        className="w-5 h-5 mr-2"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 48 48"
      >
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.72 1.22 9.24 3.6l6.9-6.9C35.88 2.6 30.3 0 24 0 14.6 0 6.77 4.82 2.73 11.8l7.98 6.2C12.7 12.7 17.8 9.5 24 9.5z"/>
        <path fill="#4285F4" d="M46.5 24c0-1.6-.14-3.14-.4-4.62H24v9.18h12.7c-.54 2.9-2.16 5.36-4.6 7.02l7.04 5.46C43.46 37.04 46.5 30.14 46.5 24z"/>
        <path fill="#FBBC05" d="M10.7 28.98a14.5 14.5 0 0 1 0-9.96l-7.98-6.2A24 24 0 0 0 0 24c0 3.8.9 7.42 2.72 10.76l8-5.78z"/>
        <path fill="#34A853" d="M24 48c6.3 0 11.9-2.06 15.9-5.6l-7.04-5.46c-2.02 1.35-4.6 2.14-8.86 2.14-6.2 0-11.3-3.2-14.28-7.98l-8 5.78C6.77 43.18 14.6 48 24 48z"/>
        <path fill="none" d="M0 0h48v48H0z"/>
      </svg>
      <span>Sign in with Google</span>
    </button>
  );
}
