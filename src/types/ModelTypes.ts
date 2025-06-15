
export interface PredictionResult {
  score: number;
  confidence: number;
  category: 'baixo' | 'medio' | 'alto';
}

export interface ModelInfo {
  totalParams: number;
  layers: number;
  architecture: string;
  vocabSize: number;
  maxSequenceLength: number;
  tokenizerSize: number;
}

export interface TrainingData {
  lyrics: string;
  score: number;
}

export interface DatasetBalance {
  lowCount: number;
  midCount: number;
  highCount: number;
  total: number;
}
