import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = ({ className = '', size = 'md' }) => {
  const { toggleTheme, isDark } = useTheme();

  // Sizes
  const sizeClasses = {
    sm: 'w-12 h-6',
    md: 'w-12 h-6',
    lg: 'w-16 h-8'
  };
  const iconSizes = { sm: 24, md: 24, lg: 28 };
  // Thumb translation: half the width minus padding
  const thumbTranslate = {
    sm: 'translate-x-6',
    md: 'translate-x-6',
    lg: 'translate-x-8'
  };
  const thumbSize = {
    sm: 'w-5 h-5',
    md: 'w-5 h-5',
    lg: 'w-7 h-7'
  };

  return (
    <button
      onClick={toggleTheme}
      className={`theme-toggle relative rounded-full transition-colors duration-300 flex items-center ${sizeClasses[size]} ${isDark ? 'bg-gray-700' : 'bg-gray-200'} ${className}`}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      style={{ minWidth: 48, minHeight: 24, padding: 0 }}
    >
      {/* Icons */}
      <div className="absolute inset-0 flex items-center justify-between px-3 pointer-events-none w-full h-full" style={{gap: '20px'}}>
        <Sun size={iconSizes[size]} className="text-yellow-500" />
        <Moon size={iconSizes[size]} className="text-blue-500" />
      </div>
      {/* Thumb */}
      <span
        className={`

          ${isDark ? thumbTranslate[size] : ''}
          ${thumbSize[size]}
        `}
      />
    </button>
  );
};

export default ThemeToggle; 