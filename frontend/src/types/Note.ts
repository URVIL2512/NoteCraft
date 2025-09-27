export interface Note {
    id: string;
    title: string;
    content: string;
    tags: string[];
    isPinned: boolean;
    isEncrypted: boolean;
    password?: string;
    encryptedContent?: string;
    isShared?: boolean;
    shareId?: string;
    shareUrl?: string;
    createdAt: string;
    updatedAt: string;
    // AI-generated content
    aiSummary?: string;
    aiTags?: string[];
    aiGlossary?: { term: string; definition: string }[];
    hasGrammarCheck?: boolean;
    hasShareLink?: boolean;
  }