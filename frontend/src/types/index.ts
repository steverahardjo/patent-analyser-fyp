export interface PDFDocument {
  id: string;
  name: string;
  size: number;
  content?: string; // In a real implementation, this would be the parsed content
  uploadDate: Date;
}

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export type ActionType = 'summarise' | 'classify' | 'findSimilarity';