
import * as tf from '@tensorflow/tfjs';
import { PredictionResult } from '../types/ModelTypes';
import { TextPreprocessor } from './TextPreprocessor';

export class ModelPredictor {
  private preprocessor: TextPreprocessor;

  constructor(preprocessor: TextPreprocessor) {
    this.preprocessor = preprocessor;
  }

  async predict(model: tf.LayersModel, lyrics: string): Promise<PredictionResult> {
    console.log('=== PREDIÇÃO ULTRA-COMPACTA ===');
    
    const sequence = this.preprocessor.preprocessText(lyrics);
    const inputTensor = tf.tensor2d([sequence]);
    let prediction: tf.Tensor | undefined;

    try {
      prediction = model.predict(inputTensor) as tf.Tensor;
      const scoreArray = await prediction.data();
      const rawScore = scoreArray[0];
      
      console.log('Score bruto:', rawScore);
      
      // Normalizar score
      const normalizedScore = Math.max(0, Math.min(1, rawScore));
      
      // Confiança baseada na distância dos extremos
      const confidence = Math.max(0.1, Math.abs(normalizedScore - 0.5) * 2);

      // Categorização
      let category: 'baixo' | 'medio' | 'alto';
      if (normalizedScore <= 0.35) {
        category = 'baixo';
      } else if (normalizedScore <= 0.65) {
        category = 'medio';
      } else {
        category = 'alto';
      }

      console.log(`Score: ${normalizedScore.toFixed(3)}, Categoria: ${category}, Confiança: ${confidence.toFixed(3)}`);

      return {
        score: normalizedScore,
        confidence: confidence,
        category: category
      };
    } finally {
      inputTensor.dispose();
      if (prediction) {
        prediction.dispose();
      }
    }
  }
}
