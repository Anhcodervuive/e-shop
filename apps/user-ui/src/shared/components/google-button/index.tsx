import * as React from 'react';

type GoogleButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

const GoogleButton = ({ className = '', children, ...props }: GoogleButtonProps) => {
  return (
    <button
      type="button"
      className={`inline-flex h-11 w-full items-center justify-center gap-3 rounded-md border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      {...props}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 48 48"
        className="h-5 w-5 shrink-0"
      >
        <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.1-.4-3.5z" />
        <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4c-7.8 0-14.6 4.4-17.7 10.7z" />
        <path fill="#4CAF50" d="M24 44c5.3 0 10.1-2 13.7-5.2l-6.3-5.2C29.5 35.3 26.9 36 24 36c-5.1 0-9.5-3.1-11.3-7.5l-6.6 5.1C9.1 39.7 16 44 24 44z" />
        <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1 2.6-2.9 4.7-5.6 6.1l.1.1 6.3 5.2C35.6 37.1 40 32 40 24c0-1.3-.1-2.1-.4-3.5z" />
      </svg>
      <span>{children ?? 'Continue with Google'}</span>
    </button>
  );
};

export default GoogleButton;
