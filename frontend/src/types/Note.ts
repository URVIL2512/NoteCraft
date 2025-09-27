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
  }