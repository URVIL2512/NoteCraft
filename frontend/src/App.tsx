import { useState, useEffect, useRef } from 'react';
import { Plus, Settings, Menu, X } from 'lucide-react';
import RichTextEditor from './componetns/RichTextEditor';
import NotesList from './componetns/NotesList';
import SearchBar from './componetns/SearchBar';
import SidebarAI from './componetns/SidebarAI';
import LandingPage from './componetns/LandingPage';
import { Note } from './types/Note';
import { loadNotes, saveNotes } from './utils/storage';
import { filterNotes } from './utils/noteUtils';

function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAIPanel, setShowAIPanel] = useState(true);
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const savedNotes = loadNotes();
    setNotes(savedNotes);
    if (savedNotes.length > 0) {
      setSelectedNote(savedNotes[0]);
    }
  }, []);

  useEffect(() => {
    if (notes.length > 0) {
      saveNotes(notes);
    }
  }, [notes]);

  const createNewNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'Untitled Note',
      content: '',
      tags: [],
      isPinned: false,
      isEncrypted: false,
      isShared: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const updatedNotes = [newNote, ...notes];
    setNotes(updatedNotes);
    setSelectedNote(newNote);
  };

  const updateNote = (updatedNote: Note) => {
    const updatedNotes = notes.map(note => 
      note.id === updatedNote.id 
        ? { ...updatedNote, updatedAt: new Date().toISOString() }
        : note
    );
    setNotes(updatedNotes);
    setSelectedNote(updatedNote);
  };

  const deleteNote = (noteId: string) => {
    const updatedNotes = notes.filter(note => note.id !== noteId);
    setNotes(updatedNotes);
    
    if (selectedNote?.id === noteId) {
      setSelectedNote(updatedNotes.length > 0 ? updatedNotes[0] : null);
    }
  };

  const togglePinNote = (noteId: string) => {
    const updatedNotes = notes.map(note =>
      note.id === noteId ? { ...note, isPinned: !note.isPinned } : note
    );
    
    updatedNotes.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
    
    setNotes(updatedNotes);
  };

  const filteredNotes = filterNotes(notes, searchTerm);

  const handleStartApp = () => {
    setShowLanding(false);
  };

  if (showLanding) {
    return <LandingPage onStart={handleStartApp} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowLeftPanel(!showLeftPanel)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title={showLeftPanel ? 'Hide notes panel' : 'Show notes panel'}
            >
              {showLeftPanel ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <h1 className="text-2xl font-bold text-gray-900">NoteCraft</h1>
          </div>
          <div className="flex items-center gap-4">
            <SearchBar 
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
            />
            <button
              onClick={createNewNote}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              New Note
            </button>
            <button
              onClick={() => setShowAIPanel(!showAIPanel)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {showLeftPanel && (
          <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
            <NotesList
              notes={filteredNotes}
              selectedNote={selectedNote}
              onSelectNote={setSelectedNote}
              onDeleteNote={deleteNote}
              onTogglePin={togglePinNote}
            />
          </div>
        )}

        <div className="flex-1 flex">
          <div className={`${showAIPanel ? 'flex-1' : 'w-full'} bg-white`}>
            {selectedNote ? (
              <RichTextEditor
                note={selectedNote}
                onUpdateNote={updateNote}
                editorRef={editorRef}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <div className="text-6xl mb-4">📝</div>
                  <p className="text-lg">Select a note to start editing</p>
                  <p className="text-sm mt-2">Or create a new note to get started</p>
                </div>
              </div>
            )}
          </div>

          {showAIPanel && selectedNote && (
            <div className="w-80 bg-white border-l border-gray-200">
              <SidebarAI note={selectedNote} editorRef={editorRef} onUpdateNote={updateNote} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;