import React from 'react';

export default function AmbientDecorations() {
  return (
    <div className="ambient-decorations" aria-hidden="true">
      {/* Soft warm bokeh floating orbs */}
      <div className="ambient-bokeh ambient-bokeh-1"></div>
      <div className="ambient-bokeh ambient-bokeh-2"></div>
      <div className="ambient-bokeh ambient-bokeh-3"></div>

      {/* Top Left Leafy Vine */}
      <svg
        className="ambient-leaf-top-left"
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0 0C40 30 70 80 80 130"
          stroke="#7A9A60"
          strokeWidth="3"
          strokeLinecap="round"
        />
        {/* Leaves */}
        <path
          d="M20 18C28 10 44 14 42 28C40 42 22 36 20 18Z"
          fill="#8EA873"
          opacity="0.9"
        />
        <path
          d="M38 32C52 26 64 36 60 50C54 62 40 52 38 32Z"
          fill="#A4BF88"
          opacity="0.85"
        />
        <path
          d="M55 60C70 54 82 66 78 80C72 92 56 82 55 60Z"
          fill="#84A168"
          opacity="0.9"
        />
        <path
          d="M70 95C85 90 95 102 90 115C82 126 68 116 70 95Z"
          fill="#9AB97E"
          opacity="0.85"
        />
        <path
          d="M80 130C88 138 98 134 96 124C94 116 84 122 80 130Z"
          fill="#84A168"
          opacity="0.9"
        />
      </svg>

      {/* Top Right Leafy Vine */}
      <svg
        className="ambient-leaf-top-right"
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M200 0C160 30 130 80 120 130"
          stroke="#7A9A60"
          strokeWidth="3"
          strokeLinecap="round"
        />
        {/* Leaves */}
        <path
          d="M180 18C172 10 156 14 158 28C160 42 178 36 180 18Z"
          fill="#8EA873"
          opacity="0.9"
        />
        <path
          d="M162 32C148 26 136 36 140 50C146 62 160 52 162 32Z"
          fill="#A4BF88"
          opacity="0.85"
        />
        <path
          d="M145 60C130 54 118 66 122 80C128 92 144 82 145 60Z"
          fill="#84A168"
          opacity="0.9"
        />
        <path
          d="M130 95C115 90 105 102 110 115C118 126 132 116 130 95Z"
          fill="#9AB97E"
          opacity="0.85"
        />
      </svg>
    </div>
  );
}