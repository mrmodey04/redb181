export interface SEOResult {
  title: string;
  description: string;
  tags: string;
}

export interface HistoryItem extends SEOResult {
  id: string;
  imageUrl: string;
  timestamp: number;
}