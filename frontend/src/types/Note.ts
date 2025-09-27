export interface Note {
    id: string;
    title: string;
    content: string;
    tags: string[];
    isPinned: boolean;
    isEncrypted: boolean;
    password?: string;
    encryptedContent?: string;
    createdAt: string;
    updatedAt: string;
  }