import React, { useRef, useEffect, useState, useCallback } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Type,
  Lock,
  Unlock,
  Eye,
  EyeOff
} from 'lucide-react';
import { Note } from '../types/Note';
import { encryptText, decryptText } from '../utils/encryption';

interface RichTextEditorProps {
  note: Note;
  onUpdateNote: (note: Note) => void;
  editorRef?: React.RefObject<HTMLDivElement>;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ note, onUpdateNote, editorRef: externalEditorRef }) => {
  const internalEditorRef = useRef<HTMLDivElement>(null);
  const editorRef = externalEditorRef || internalEditorRef;
  const titleRef = useRef<HTMLInputElement>(null);
  const [fontSize, setFontSize] = useState(16);
  const saveTimerRef = useRef<number | null>(null);
  const lastContentRef = useRef<string>(note.content || '');
  const [showEncryption, setShowEncryption] = useState(false);
  const [showDecryption, setShowDecryption] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isDecrypted, setIsDecrypted] = useState(!note.isEncrypted);
  const [decryptionError, setDecryptionError] = useState('');
  const [encryptionError, setEncryptionError] = useState('');

  useEffect(() => {
    if (editorRef.current && isDecrypted) {
      // Force LTR direction (do not force text-align to preserve alignment commands)
      editorRef.current.style.direction = 'ltr';
      editorRef.current.style.unicodeBidi = 'plaintext';
      editorRef.current.style.writingMode = 'horizontal-tb';
      editorRef.current.setAttribute('dir', 'ltr');
      
      // Force LTR on all child elements
      const allElements = editorRef.current.querySelectorAll('*');
      allElements.forEach(el => {
        (el as HTMLElement).style.direction = 'ltr';
        (el as HTMLElement).style.unicodeBidi = 'plaintext';
        (el as HTMLElement).setAttribute('dir', 'ltr');
      });
    }
    if (titleRef.current) {
      titleRef.current.value = note.title;
    }
    setIsDecrypted(!note.isEncrypted);
    setPassword('');
    setDecryptionError('');
  }, [note.id, note.content, note.title, note.isEncrypted]);

  const enforceLTR = useCallback(() => {
    if (!editorRef.current) return;
    
    // Force LTR on the editor and all its children (do not force text-align)
    const root = editorRef.current as HTMLElement;
    root.setAttribute('dir', 'ltr');
    root.style.setProperty('direction', 'ltr', 'important');
    root.style.setProperty('unicode-bidi', 'plaintext', 'important');
    root.style.setProperty('writing-mode', 'horizontal-tb', 'important');
    
    const allElements = root.querySelectorAll('*');
    allElements.forEach(node => {
      const el = node as HTMLElement;
      el.setAttribute('dir', 'ltr');
      el.style.setProperty('direction', 'ltr', 'important');
      el.style.setProperty('unicode-bidi', 'plaintext', 'important');
      el.style.setProperty('writing-mode', 'horizontal-tb', 'important');
    });
  }, []);

  const executeCommand = (command: string, value?: string) => {
    if (!editorRef.current) return;
    
    // Focus the editor first
    editorRef.current.focus();
    
    // Execute the formatting command
    document.execCommand(command, false, value);
    
    // Re-apply dir attribute but do not override textAlign - keep user's alignment
    editorRef.current.setAttribute('dir', 'ltr');
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      // Ensure caret stays at the end of the current line after formatting
      const range = selection.getRangeAt(0);
      selection.removeAllRanges();
      selection.addRange(range);
    }
    
    // Update the note content with the formatted HTML
    const updatedNote = { ...note, content: editorRef.current.innerHTML };
    onUpdateNote(updatedNote);
  };

  // Helpers: alignment using execCommand and caret stabilization
  const placeCaretAtEnd = () => {
    if (!editorRef.current) return;
    const el = editorRef.current;
    el.focus();
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    const sel = window.getSelection();
    if (!sel) return;
    sel.removeAllRanges();
    sel.addRange(range);
  };

  const alignBlock = (type: 'left' | 'center' | 'right') => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    const cmd = type === 'left' ? 'justifyLeft' : type === 'center' ? 'justifyCenter' : 'justifyRight';
    document.execCommand(cmd, false);
    // Ensure block direction stays LTR without overriding chosen alignment
    const sel = window.getSelection();
    if (sel && sel.focusNode) {
      const parent = (sel.focusNode as HTMLElement).parentElement as HTMLElement | null;
      if (parent) {
        parent.setAttribute('dir', 'ltr');
        parent.style.setProperty('direction', 'ltr', 'important');
        parent.style.setProperty('unicode-bidi', 'plaintext', 'important');
      }
    }
    // Keep caret intuitive
    placeCaretAtEnd();
    // Persist content once
    const html = editorRef.current.innerHTML;
    if (html !== lastContentRef.current) {
      lastContentRef.current = html;
      onUpdateNote({ ...note, content: html });
    }
  };


  const handleTitleChange = () => {
    if (titleRef.current) {
      const newTitle = titleRef.current.value;
      const updatedNote = { ...note, title: newTitle };
      onUpdateNote(updatedNote);
    }
  };

  const handleFontSizeChange = (size: number) => {
    setFontSize(size);
    if (editorRef.current) {
      editorRef.current.style.fontSize = `${size}px`;
    }
  };

  const encryptNote = () => {
    if (!password.trim()) {
      setEncryptionError('Please enter a password');
      return;
    }
    try {
      const encryptedContent = encryptText(note.content, password);
      const updatedNote = {
        ...note,
        isEncrypted: true,
        encryptedContent,
        content: '',
      };
      onUpdateNote(updatedNote);
      setIsDecrypted(false);
      setShowEncryption(false);
      setPassword('');
      setEncryptionError('');
    } catch {
      setEncryptionError('Failed to encrypt note');
    }
  };

  const decryptNote = () => {
    if (!password.trim()) {
      setDecryptionError('Please enter a password');
      return;
    }
    try {
      const decryptedContent = decryptText(note.encryptedContent || '', password);
      const updatedNote = {
        ...note,
        isEncrypted: false,
        content: decryptedContent,
        encryptedContent: undefined,
      };
      onUpdateNote(updatedNote);
      setIsDecrypted(true);
      setShowDecryption(false);
      setPassword('');
      setDecryptionError('');
    } catch {
      setDecryptionError('Incorrect password or corrupted data');
    }
  };

  const removePassword = () => {
    if (!password.trim()) {
      setDecryptionError('Please enter the current password to remove protection');
      return;
    }
    
    try {
      // First verify the password by attempting to decrypt
      const decryptedContent = decryptText(note.encryptedContent || '', password);
      
      if (window.confirm('Are you sure you want to remove password protection from this note?')) {
        const updatedNote = { 
          ...note, 
          isEncrypted: false, 
          encryptedContent: undefined,
          content: decryptedContent // Restore the decrypted content
        };
        onUpdateNote(updatedNote);
        setIsDecrypted(true);
        setShowDecryption(false);
        setPassword('');
        setDecryptionError('');
      }
    } catch {
      setDecryptionError('Incorrect password. Please enter the correct password to remove protection.');
    }
  };

  if (note.isEncrypted && !isDecrypted) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full mx-4">
          <div className="flex items-center gap-3 mb-6">
            <Lock className="h-6 w-6 text-red-600" />
            <h2 className="text-xl font-semibold text-gray-900">Encrypted Note</h2>
          </div>
          <p className="text-gray-600 mb-4">This note is password protected. Enter the password to view, edit, or remove protection.</p>
          <div className="space-y-4">
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setDecryptionError('');
                }}
                placeholder="Enter password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                onKeyPress={(e) => e.key === 'Enter' && decryptNote()}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {decryptionError && <p className="text-red-600 text-sm">{decryptionError}</p>}
            <div className="flex gap-2">
              <button
                onClick={decryptNote}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Decrypt Note
              </button>
              <button
                onClick={removePassword}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                title="Enter correct password to remove protection"
              >
                Remove Password
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-gray-200 p-4 bg-white">
        <input
          ref={titleRef}
          value={note.title}
          onChange={handleTitleChange}
          className="w-full text-2xl font-bold border-none outline-none bg-transparent text-gray-900 placeholder-gray-400"
          placeholder="Note title..."
          dir="ltr"
          style={{
            direction: 'ltr',
            textAlign: 'left',
            unicodeBidi: 'plaintext'
          }}
        />
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button onClick={() => executeCommand('bold')} className="p-2 hover:bg-gray-200 rounded transition-colors" title="Bold">
                <Bold className="h-4 w-4" />
              </button>
              <button onClick={() => executeCommand('italic')} className="p-2 hover:bg-gray-200 rounded transition-colors" title="Italic">
                <Italic className="h-4 w-4" />
              </button>
              <button onClick={() => executeCommand('underline')} className="p-2 hover:bg-gray-200 rounded transition-colors" title="Underline">
                <Underline className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button onClick={() => alignBlock('left')} className="p-2 hover:bg-gray-200 rounded transition-colors" title="Align Left">
                <AlignLeft className="h-4 w-4" />
              </button>
              <button onClick={() => alignBlock('center')} className="p-2 hover:bg-gray-200 rounded transition-colors" title="Align Center">
                <AlignCenter className="h-4 w-4" />
              </button>
              <button onClick={() => alignBlock('right')} className="p-2 hover:bg-gray-200 rounded transition-colors" title="Align Right">
                <AlignRight className="h-4 w-4" />
              </button>
              {/* Explicit block direction reset to guard RTL fallback in some browsers */}
              <button onClick={() => {
                if (!editorRef.current) return;
                document.execCommand('formatBlock', false, 'p');
                editorRef.current.setAttribute('dir', 'ltr');
                const selection = window.getSelection();
                if (selection && selection.focusNode) {
                  const block = (selection.focusNode as HTMLElement).parentElement as HTMLElement;
                  if (block) {
                    block.setAttribute('dir', 'ltr');
                    block.style.setProperty('direction', 'ltr', 'important');
                    block.style.setProperty('unicode-bidi', 'plaintext', 'important');
                  }
                }
              }} className="p-2 hover:bg-gray-200 rounded transition-colors" title="Force LTR Block">
                LTR
              </button>
            </div>
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
              <Type className="h-4 w-4 text-gray-600" />
              <select
                value={fontSize}
                onChange={(e) => handleFontSizeChange(Number(e.target.value))}
                className="bg-transparent border-none outline-none text-sm"
              >
                {[12, 14, 16, 18, 20, 22, 24].map(size => (
                  <option key={size} value={size}>{size}px</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!note.isEncrypted && (
              <button
                onClick={() => setShowEncryption(true)}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Encrypt Note"
              >
                <Lock className="h-4 w-4" />
                Set Password
              </button>
            )}
            {note.isEncrypted && (
              <button
                onClick={() => setShowDecryption(true)}
                className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                title="Enter Password"
              >
                <Unlock className="h-4 w-4" />
                Enter Password
              </button>
            )}
          </div>
        </div>
      </div>

      {showEncryption && (
        <div className="bg-yellow-50 border-b border-yellow-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 mr-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Set Password for Encryption</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setEncryptionError('');
                  }}
                  placeholder="Enter a strong password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {encryptionError && <p className="text-red-600 text-sm mt-1">{encryptionError}</p>}
            </div>
            <div className="flex gap-2">
              <button onClick={encryptNote} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">Encrypt</button>
              <button onClick={() => {
                setShowEncryption(false);
                setPassword('');
                setEncryptionError('');
              }} className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col">
        <div
          ref={editorRef}
          contentEditable
          dangerouslySetInnerHTML={{ __html: note.content }}
          onInput={(e) => {
            const html = e.currentTarget.innerHTML;
            // Debounce save to avoid selection jitter
            if (saveTimerRef.current) {
              window.clearTimeout(saveTimerRef.current);
            }
            saveTimerRef.current = window.setTimeout(() => {
              if (html !== lastContentRef.current) {
                lastContentRef.current = html;
                onUpdateNote({ ...note, content: html });
              }
            }, 150);

            // Light LTR normalization without overriding alignment
            setTimeout(() => enforceLTR(), 80);
          }}
          onKeyDown={(e) => {
            // Debounce LTR enforcement on key press
            setTimeout(() => enforceLTR(), 50);
          }}
          onPaste={(e) => {
            // Enforce LTR after paste
            setTimeout(() => enforceLTR(), 50);
          }}
          className="flex-1 w-full h-full p-6 outline-none resize-none border-none overflow-y-auto"
          style={{
            fontSize: `${fontSize}px`,
            lineHeight: '1.6',
            direction: 'ltr',
            unicodeBidi: 'plaintext',
            writingMode: 'horizontal-tb',
            fontFamily: 'inherit',
            whiteSpace: 'pre-wrap',
            tabSize: 4,
            minHeight: '100%',
            width: '100%',
            wordWrap: 'break-word',
            overflowWrap: 'break-word'
          }}
          dir="ltr"
          data-placeholder="Start typing your note..."
        />
      </div>
    </div>
  );
};

export default RichTextEditor;

