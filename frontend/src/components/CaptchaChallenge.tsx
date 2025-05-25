
import React from 'react';

interface CaptchaChallengeProps {
  captchaText: string;
  onRefresh: () => void;
}

// Simple SVG for Refresh icon if lucide-react is not available/preferred
const RefreshIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 11A8.1 8.1 0 0 0 4.5 9M4 5v4h4"/>
    <path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4"/>
  </svg>
);


const CaptchaChallenge: React.FC<CaptchaChallengeProps> = ({ captchaText, onRefresh }) => {
  return (
    <div className="flex items-center space-x-3 p-3 bg-gray-100 border border-gray-300 rounded-lg">
      <span 
        className="text-2xl font-bold tracking-wider text-gray-700 select-none"
        style={{ 
          fontFamily: "'Courier New', Courier, monospace",
          backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22150%22%20height%3D%2250%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cfilter%20id%3D%22noiseFilter%22%3E%3CfeTurbulence%20type%3D%22fractalNoise%22%20baseFrequency%3D%220.65%22%20numOctaves%3D%223%22%20stitchTiles%3D%22stitch%22/%3E%3C%2Ffilter%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20filter%3D%22url(%23noiseFilter)%22%20opacity%3D%220.1%22/%3E%3C%2Fsvg%3E")',
          letterSpacing: '0.2em',
          padding: '5px 10px',
          border: '1px dashed #ccc',
          borderRadius: '4px',
          backgroundColor: '#f9f9f9'
        }}
      >
        {captchaText}
      </span>
      <button
        type="button"
        onClick={onRefresh}
        title="Refresh CAPTCHA"
        className="p-2 text-gray-600 hover:text-primary transition-colors duration-150 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
      >
        <RefreshIcon />
        <span className="sr-only">Refresh CAPTCHA</span>
      </button>
    </div>
  );
};

export default CaptchaChallenge;
    