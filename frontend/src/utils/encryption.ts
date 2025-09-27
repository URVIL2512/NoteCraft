export const encryptText = (text: string, password: string): string => {
    if (!text || !password) {
      throw new Error('Text and password are required');
    }
    
    let encrypted = '';
    const passwordLength = password.length;
    
    for (let i = 0; i < text.length; i++) {
      const textChar = text.charCodeAt(i);
      const passwordChar = password.charCodeAt(i % passwordLength);
      const encryptedChar = textChar ^ passwordChar;
      encrypted += String.fromCharCode(encryptedChar);
    }
    
    return btoa(encrypted);
  };
  
  export const decryptText = (encryptedText: string, password: string): string => {
    if (!encryptedText || !password) {
      throw new Error('Encrypted text and password are required');
    }
    
    try {
      const encrypted = atob(encryptedText);
      let decrypted = '';
      const passwordLength = password.length;
      
      for (let i = 0; i < encrypted.length; i++) {
        const encryptedChar = encrypted.charCodeAt(i);
        const passwordChar = password.charCodeAt(i % passwordLength);
        const decryptedChar = encryptedChar ^ passwordChar;
        decrypted += String.fromCharCode(decryptedChar);
      }
      
      return decrypted;
    } catch (error) {
      throw new Error('Failed to decrypt - invalid password or corrupted data');
    }
  };