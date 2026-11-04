import React from 'react';
import './Header.css';

export default function Header() {
  return (
    <header className="header-container">
      {/* Decorative Sparkle Accents */}
      <div className="header-badge">
        <span className="header-doodle-sparkle left">✨</span>
        <div className="header-icon-wrapper">
          <svg
            className="jar-mini-logo"
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Jar Lid */}
            <path
              d="M22 14C22 11.7909 23.7909 10 26 10H38C40.2091 10 42 11.7909 42 14H22Z"
              fill="#C89D7C"
            />
            <rect x="20" y="14" width="24" height="4" rx="2" fill="#B48261" />
            
            {/* Jar Body */}
            <path
              d="M18 20C18 18.8954 18.8954 18 20 18H44C45.1046 18 46 18.8954 46 20V48C46 54.6274 40.6274 60 34 60H30C23.3726 60 18 54.6274 18 48V20Z"
              fill="rgba(240, 248, 255, 0.7)"
              stroke="#E28E9D"
              strokeWidth="2.5"
            />
            
            {/* Heart on Jar */}
            <path
              d="M32 40L29.5 37.5C25.5 33.5 24 31 24 28C24 25.5 26 23.5 28.5 23.5C30 23.5 31.2 24.2 32 25.2C32.8 24.2 34 23.5 35.5 23.5C38 23.5 40 25.5 40 28C40 31 38.5 33.5 34.5 37.5L32 40Z"
              fill="#F48B9F"
            />
          </svg>
        </div>
        <h1 className="header-title">Memory Jar</h1>
        <span className="header-doodle-sparkle right">✨</span>
      </div>

      <p className="header-tagline">
        Little moments. A lifetime of memories. <span className="heart-symbol">♡</span>
      </p>
    </header>
  );
}
