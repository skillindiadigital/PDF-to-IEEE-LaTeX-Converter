export interface PaperMetadata {
  index: number;
  title: string;
}

export interface PaperResult {
  id: string;
  metadata: PaperMetadata;
  latex: string | null;
  status: 'pending' | 'processing' | 'success' | 'error';
  error?: string;
}

export interface ConversionError {
  message: string;
}

export enum AppState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  PROCESSING = 'PROCESSING',
  FINISHED = 'FINISHED',
  ERROR = 'ERROR'
}