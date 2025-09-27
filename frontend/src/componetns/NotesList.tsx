import React from 'react';
import { Pin, Trash2, Lock, Calendar } from 'lucide-react';
import { Note } from '../types/Note';

interface NotesListProps {
  notes: Note[];
  selectedNote: Note | null;
  onSelectNote: (note: Note) => void;
  onDeleteNote: (noteId: string) => void;
  onTogglePin: (noteId: string) => void;
}

const NotesList: React.FC<NotesListProps> = ({
  notes,
  selectedNote,
  onSelectNote,
  onDeleteNote,
  onTogglePin,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    
    return date.toLocaleDateString();
  };

  const getContentPreview = (content: string, isEncrypted: boolean) => {
    if (isEncrypted) return 'This note is encrypted';
    
    const textContent = content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    return textContent.slice(0, 120) + (textContent.length > 120 ? '...' : '');
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          Notes ({notes.length})
        </h2>
      </div>

      <div className="flex-1 overflow-auto">
        {notes.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <div className="text-4xl mb-4">📝</div>
              <p>No notes yet</p>
              <p className="text-sm mt-2">Create your first note to get started</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {notes.map((note) => (
              <div
                key={note.id}
                onClick={() => onSelectNote(note)}
                className={`p-4 cursor-pointer transition-colors hover:bg-blue-50 ${
                  selectedNote?.id === note.id ? 'bg-blue-100 border-r-4 border-blue-600' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-gray-900 truncate flex-1 mr-2">
                    {note.title || 'Untitled Note'}
                  </h3>
                  <div className="flex items-center gap-1">
                    {note.isPinned && (
                      <Pin className="h-4 w-4 text-orange-500 fill-current" />
                    )}
                    {note.isEncrypted && (
                      <Lock className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                  {getContentPreview(note.content, note.isEncrypted)}
                </p>

                {note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {note.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                    {note.tags.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{note.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center text-xs text-gray-500">
                    <Calendar className="h-3 w-3 mr-1" />
                    {formatDate(note.updatedAt)}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onTogglePin(note.id);
                      }}
                      className={`p-1 rounded transition-colors ${
                        note.isPinned
                          ? 'text-orange-500 hover:text-orange-600'
                          : 'text-gray-400 hover:text-orange-500'
                      }`}
                      title={note.isPinned ? 'Unpin note' : 'Pin note'}
                    >
                      <Pin className={`h-4 w-4 ${note.isPinned ? 'fill-current' : ''}`} />
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm('Are you sure you want to delete this note?')) {
                          onDeleteNote(note.id);
                        }
                      }}
                      className="p-1 rounded text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete note"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesList;