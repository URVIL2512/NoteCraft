import React, { useRef, useEffect, useState } from 'react';
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
  editorRef?: React.RefObject<HTMLTextAreaElement>;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ note, onUpdateNote, editorRef: externalEditorRef }) => {
  const internalEditorRef = useRef<HTMLTextAreaElement>(null);
  const editorRef = externalEditorRef || internalEditorRef;
  const titleRef = useRef<HTMLInputElement>(null);
  const [fontSize, setFontSize] = useState(16);
  const [showEncryption, setShowEncryption] = useState(false);
  const [showDecryption, setShowDecryption] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isDecrypted, setIsDecrypted] = useState(!note.isEncrypted);
  const [decryptionError, setDecryptionError] = useState('');
  const [encryptionError, setEncryptionError] = useState('');

  useEffect(() => {
    if (editorRef.current && isDecrypted) {
      // Force LTR direction for textarea
      editorRef.current.style.direction = 'ltr';
      editorRef.current.style.textAlign = 'left';
      editorRef.current.style.unicodeBidi = 'normal';
      editorRef.current.setAttribute('dir', 'ltr');
    }
    if (titleRef.current) {
      titleRef.current.value = note.title;
    }
    setIsDecrypted(!note.isEncrypted);
    setPassword('');
    setDecryptionError('');
  }, [note.id, note.content, note.title, note.isEncrypted]);

  const executeCommand = (command: string, value?: string) => {
    if (!editorRef.current) return;
    
    const textarea = editorRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const beforeText = textarea.value.substring(0, start);
    const afterText = textarea.value.substring(end);
    
    let newText = '';
    
    switch (command) {
      case 'bold':
        if (selectedText) {
          newText = `**${selectedText}**`;
        } else {
          newText = '**bold text**';
        }
        break;
      case 'italic':
        if (selectedText) {
          newText = `*${selectedText}*`;
        } else {
          newText = '*italic text*';
        }
        break;
      case 'underline':
        if (selectedText) {
          newText = `<u>${selectedText}</u>`;
        } else {
          newText = '<u>underlined text</u>';
        }
        break;
      case 'justifyLeft':
        if (selectedText) {
          newText = selectedText;
        } else {
          newText = 'Left aligned text';
        }
        break;
      case 'justifyCenter':
        if (selectedText) {
          newText = `\n\n${selectedText}\n\n`;
        } else {
          newText = '\n\nCentered text\n\n';
        }
        break;
      case 'justifyRight':
        if (selectedText) {
          newText = `\t\t\t${selectedText}`;
        } else {
          newText = '\t\t\tRight aligned text';
        }
        break;
      default:
        return;
    }
    
    const newContent = beforeText + newText + afterText;
    const updatedNote = { ...note, content: newContent };
    onUpdateNote(updatedNote);
    
    // Focus and set cursor position
    textarea.focus();
    setTimeout(() => {
      const newCursorPos = start + newText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
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
              <button onClick={() => executeCommand('justifyLeft')} className="p-2 hover:bg-gray-200 rounded transition-colors" title="Align Left">
                <AlignLeft className="h-4 w-4" />
              </button>
              <button onClick={() => executeCommand('justifyCenter')} className="p-2 hover:bg-gray-200 rounded transition-colors" title="Align Center">
                <AlignCenter className="h-4 w-4" />
              </button>
              <button onClick={() => executeCommand('justifyRight')} className="p-2 hover:bg-gray-200 rounded transition-colors" title="Align Right">
                <AlignRight className="h-4 w-4" />
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
        <textarea
          ref={editorRef}
          value={note.content}
          onChange={(e) => {
            const updatedNote = { ...note, content: e.target.value };
            onUpdateNote(updatedNote);
          }}
          className="flex-1 w-full h-full p-6 outline-none resize-none border-none"
          style={{
            fontSize: `${fontSize}px`,
            lineHeight: '1.6',
            direction: 'ltr',
            textAlign: 'left',
            unicodeBidi: 'normal',
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
          placeholder="Start typing your note..."
        />
      </div>
    </div>
  );
};

export default RichTextEditor;
