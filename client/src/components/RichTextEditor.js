import React from 'react';

const RichTextEditor = ({ value, onChange, placeholder = 'Write your content here...' }) => {
  const handleChange = (e) => {
    onChange(e.target.value);
  };

  return (
    <div className="rich-text-editor">
      <textarea
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="form-input"
      />
    </div>
  );
};

export default RichTextEditor; 