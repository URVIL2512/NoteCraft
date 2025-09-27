import { Note } from '../types/Note';

export const filterNotes = (notes: Note[], searchTerm: string, showPinnedOnly: boolean = false): Note[] => {
  let filteredNotes = notes;
  
  // Filter by pinned status first
  if (showPinnedOnly) {
    filteredNotes = filteredNotes.filter(note => note.isPinned);
  }
  
  // Then filter by search term
  if (searchTerm.trim()) {
    const term = searchTerm.toLowerCase();
    
    filteredNotes = filteredNotes.filter(note => {
      const titleMatch = note.title.toLowerCase().includes(term);
      const contentMatch = note.isEncrypted 
        ? false 
        : note.content.toLowerCase().replace(/<[^>]*>/g, '').includes(term);
      const tagsMatch = note.tags.some(tag => tag.toLowerCase().includes(term));
      
      return titleMatch || contentMatch || tagsMatch;
    });
  }
  
  return filteredNotes;
};

export const sortNotes = (notes: Note[]): Note[] => {
  return [...notes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
};

export const getWordCount = (content: string): number => {
  const textContent = content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  return textContent ? textContent.split(' ').length : 0;
};

export const getCharacterCount = (content: string): number => {
  const textContent = content.replace(/<[^>]*>/g, '');
  return textContent.length;
};

export const getReadingTime = (content: string): number => {
  const wordCount = getWordCount(content);
  return Math.ceil(wordCount / 200);
};