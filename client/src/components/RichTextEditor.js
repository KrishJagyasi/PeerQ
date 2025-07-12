import React, { useState, useRef, useEffect } from 'react';
import { 
  Bold, 
  Italic, 
  Strikethrough, 
  Underline,
  List, 
  ListOrdered, 
  Link, 
  Image, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Smile,
  X
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const RichTextEditor = ({ value, onChange, placeholder = 'Write your content here...' }) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [showMentionSuggestions, setShowMentionSuggestions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionSuggestions, setMentionSuggestions] = useState([]);
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);

  // Common emojis
  const emojis = [
    '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
    '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
    '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
    '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
    '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬',
    '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗',
    '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😯', '😦', '😧',
    '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢',
    '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '💩', '👻', '💀',
    '☠️', '👽', '👾', '🤖', '😺', '😸', '😹', '😻', '😼', '😽',
    '🙀', '😿', '😾', '🙈', '🙉', '🙊', '👶', '👧', '🧒', '👦',
    '👩', '🧑', '👨', '👵', '🧓', '👴', '👸', '🤴', '👳', '👲',
    '🧕', '🤵', '👰', '🤰', '🤱', '👼', '🎅', '🤶', '🧙', '🧚',
    '🧛', '🧜', '🧝', '🧞', '🧟', '🧌', '👹', '👺', '🤡', '💫',
    '⭐', '🌟', '✨', '⚡', '💥', '🔥', '💢', '💦', '💨', '💫',
    '💤', '💨', '💧', '💩', '💯', '💢', '💥', '💫', '💦', '💨',
    '💤', '💨', '💧', '💩', '💯', '💢', '💥', '💫', '💦', '💨'
  ];

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showEmojiPicker && !event.target.closest('.emoji-picker') && !event.target.closest('.emoji-button')) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showEmojiPicker]);

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current.focus();
    updateContent();
  };

  const updateContent = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      execCommand('insertLineBreak');
    }
    
    // Keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'b':
          e.preventDefault();
          execCommand('bold');
          break;
        case 'i':
          e.preventDefault();
          execCommand('italic');
          break;
        case 'u':
          e.preventDefault();
          execCommand('underline');
          break;
        case 'z':
          if (e.shiftKey) {
            e.preventDefault();
            execCommand('redo');
          } else {
            e.preventDefault();
            execCommand('undo');
          }
          break;
        default:
          break;
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  };

  const insertEmoji = (emoji) => {
    execCommand('insertText', emoji);
    setShowEmojiPicker(false);
  };

  const insertLink = () => {
    if (linkUrl && linkText) {
      const linkHtml = `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${linkText}</a>`;
      execCommand('insertHTML', linkHtml);
      setShowLinkDialog(false);
      setLinkUrl('');
      setLinkText('');
    }
  };

  const insertImage = () => {
    if (imageUrl) {
      const imgHtml = `<img src="${imageUrl}" alt="${imageAlt || 'Image'}" style="max-width: 100%; height: auto;" />`;
      execCommand('insertHTML', imgHtml);
      setShowImageDialog(false);
      setImageUrl('');
      setImageAlt('');
    }
  };

  const insertMention = (username) => {
    const mentionHtml = `<a href="/profile/${username}" class="mention">@${username}</a>`;
    execCommand('insertHTML', mentionHtml);
    setShowMentionSuggestions(false);
    setMentionQuery('');
  };

  const handleMentionSearch = async (query) => {
    if (query.startsWith('@') && query.length > 1) {
      const searchTerm = query.slice(1);
      try {
        const response = await axios.get(`/api/users/search?q=${encodeURIComponent(searchTerm)}`);
        setMentionSuggestions(response.data.users || []);
        setShowMentionSuggestions(true);
      } catch (error) {
        console.error('Failed to fetch mention suggestions:', error);
      }
    } else {
      setShowMentionSuggestions(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error('Image size must be less than 5MB');
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('image', file);

      const response = await axios.post('/api/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const imgHtml = `<img src="${response.data.url}" alt="Uploaded image" style="max-width: 100%; height: auto;" />`;
      execCommand('insertHTML', imgHtml);
      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const ToolbarButton = ({ icon: Icon, onClick, title, active = false, disabled = false, className = '' }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-2 rounded-md transition-all duration-150 ${
        active ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      <Icon size={16} />
    </button>
  );

  return (
    <div className="rich-text-editor bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md">
      {/* Professional Toolbar */}
      <div className="toolbar bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-b border-gray-200 dark:border-gray-700 px-2 sm:px-4 py-2 sm:py-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center space-x-1 flex-wrap">
            {/* Text Formatting Group */}
            <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 p-1 mb-1 sm:mb-0 sm:mr-3">
              <ToolbarButton
                icon={Bold}
                onClick={() => execCommand('bold')}
                title="Bold (Ctrl+B)"
                className="hover:bg-blue-50 dark:hover:bg-blue-900/20"
              />
              <ToolbarButton
                icon={Italic}
                onClick={() => execCommand('italic')}
                title="Italic (Ctrl+I)"
                className="hover:bg-blue-50 dark:hover:bg-blue-900/20"
              />
              <ToolbarButton
                icon={Underline}
                onClick={() => execCommand('underline')}
                title="Underline (Ctrl+U)"
                className="hover:bg-blue-50 dark:hover:bg-blue-900/20"
              />
              <ToolbarButton
                icon={Strikethrough}
                onClick={() => execCommand('strikeThrough')}
                title="Strikethrough"
                className="hover:bg-blue-50 dark:hover:bg-blue-900/20"
              />
            </div>

            {/* Lists Group */}
            <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 p-1 mb-1 sm:mb-0 sm:mr-3">
              <ToolbarButton
                icon={List}
                onClick={() => execCommand('insertUnorderedList')}
                title="Bullet List"
                className="hover:bg-green-50 dark:hover:bg-green-900/20"
              />
              <ToolbarButton
                icon={ListOrdered}
                onClick={() => execCommand('insertOrderedList')}
                title="Numbered List"
                className="hover:bg-green-50 dark:hover:bg-green-900/20"
              />
            </div>

            {/* Alignment Group - Hidden on very small screens */}
            <div className="hidden sm:flex items-center bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 p-1 mr-3">
              <ToolbarButton
                icon={AlignLeft}
                onClick={() => execCommand('justifyLeft')}
                title="Align Left"
                className="hover:bg-purple-50 dark:hover:bg-purple-900/20"
              />
              <ToolbarButton
                icon={AlignCenter}
                onClick={() => execCommand('justifyCenter')}
                title="Align Center"
                className="hover:bg-purple-50 dark:hover:bg-purple-900/20"
              />
              <ToolbarButton
                icon={AlignRight}
                onClick={() => execCommand('justifyRight')}
                title="Align Right"
                className="hover:bg-purple-50 dark:hover:bg-purple-900/20"
              />
            </div>

            {/* Media Group */}
            <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 p-1 mb-1 sm:mb-0 sm:mr-3">
              <ToolbarButton
                icon={Link}
                onClick={() => setShowLinkDialog(true)}
                title="Insert Link"
                className="hover:bg-orange-50 dark:hover:bg-orange-900/20"
              />
              <ToolbarButton
                icon={Image}
                onClick={() => fileInputRef.current?.click()}
                title="Upload Image"
                disabled={isUploading}
                className="hover:bg-orange-50 dark:hover:bg-orange-900/20"
              />
            </div>

            {/* Emoji Picker */}
            <div className="relative">
              <ToolbarButton
                icon={Smile}
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                title="Insert Emoji"
                className="hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
              />
              {showEmojiPicker && (
                <div className="absolute top-full left-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-xl z-50 p-4 w-80 max-w-[90vw] max-h-64 overflow-y-auto">
                  <div className="mb-3">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Choose an emoji</h3>
                  </div>
                  <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
                    {emojis.map((emoji, index) => (
                      <button
                        key={index}
                        onClick={() => insertEmoji(emoji)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-lg transition-colors duration-150 min-h-[44px]"
                        title={emoji}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Character Count - Hidden on very small screens */}
          <div className="hidden sm:block text-xs text-gray-500 dark:text-gray-400 font-medium">
            {value.replace(/<[^>]*>/g, '').length} characters
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className="relative">
        <div
          ref={editorRef}
          contentEditable
          className="min-h-[200px] sm:min-h-[300px] p-3 sm:p-6 focus:outline-none text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 leading-relaxed"
          dir="ltr"
          spellCheck={true}
          autoCorrect="on"
          autoCapitalize="sentences"
          tabIndex={0}
          style={{ outline: 'none' }}
          placeholder={placeholder}  
          onInput={updateContent}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          dangerouslySetInnerHTML={{ __html: value }}
          data-placeholder={placeholder}
        />
        
        {/* Writing Guidelines - Responsive */}
        <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 text-xs text-gray-400 dark:text-gray-500">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-1 sm:space-y-0 sm:space-x-4">
            <span className="hidden sm:inline">💡 Tip: Use Ctrl+B for bold, Ctrl+I for italic</span>
            <span className="text-xs">📝 Write clearly and be specific</span>
          </div>
        </div>
      </div>

      {/* Hidden file input for image upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* Mention Suggestions */}
      {showMentionSuggestions && mentionSuggestions.length > 0 && (
        <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-50 p-2 max-w-64 max-h-48 overflow-y-auto">
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Mention users:</div>
          {mentionSuggestions.map((user) => (
            <button
              key={user._id}
              onClick={() => insertMention(user.username)}
              className="w-full text-left p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-sm text-gray-900 dark:text-gray-100"
            >
              @{user.username}
            </button>
          ))}
        </div>
      )}

      {/* Link Dialog */}
      {showLinkDialog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-96 max-w-[90vw] transform transition-all">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                  <Link className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Insert Link</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Add a hyperlink to your content</p>
                </div>
              </div>
              <button
                onClick={() => setShowLinkDialog(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Link Text
                </label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 transition-colors"
                  placeholder="Enter link text..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  URL
                </label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 transition-colors"
                  placeholder="https://example.com"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowLinkDialog(false)}
                className="px-6 py-2.5 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={insertLink}
                disabled={!linkUrl || !linkText}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
              >
                Insert Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Dialog */}
      {showImageDialog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-96 max-w-[90vw] transform transition-all">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                  <Image className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Insert Image</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Add an image to your content</p>
                </div>
              </div>
              <button
                onClick={() => setShowImageDialog(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Image URL
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-gray-100 transition-colors"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Alt Text
                </label>
                <input
                  type="text"
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-gray-100 transition-colors"
                  placeholder="Image description"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowImageDialog(false)}
                className="px-6 py-2.5 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={insertImage}
                disabled={!imageUrl}
                className="px-6 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
              >
                Insert Image
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RichTextEditor; 