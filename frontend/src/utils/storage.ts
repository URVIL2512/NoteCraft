import { Note } from '../types/Note';

const NOTES_STORAGE_KEY = 'smartnotes_notes';

export const loadNotes = (): Note[] => {
  try {
    const savedNotes = localStorage.getItem(NOTES_STORAGE_KEY);
    if (savedNotes) {
      const notes: Note[] = JSON.parse(savedNotes);
      return notes.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
    }
    return [];
  } catch (error) {
    console.error('Failed to load notes from localStorage:', error);
    return [];
  }
};

export const saveNotes = (notes: Note[]): void => {
  try {
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
  } catch (error) {
    console.error('Failed to save notes to localStorage:', error);
  }
};

export const exportNotes = (): string => {
  const notes = loadNotes();
  return JSON.stringify(notes, null, 2);
};

export const importNotes = (notesJson: string): Note[] => {
  try {
    const importedNotes: Note[] = JSON.parse(notesJson);
    const currentNotes = loadNotes();
    
    const mergedNotes = [...currentNotes];
    importedNotes.forEach(importedNote => {
      if (!mergedNotes.find(note => note.id === importedNote.id)) {
        mergedNotes.push(importedNote);
      }
    });
    
    saveNotes(mergedNotes);
    return mergedNotes;
  } catch (error) {
    console.error('Failed to import notes:', error);
    throw new Error('Invalid notes format');
  }
};