
import * as tf from '@tensorflow/tfjs';
import { TrainingData } from '../types/ModelTypes';
import { TextPreprocessor } from './TextPreprocessor';

export class ModelTrainer {
  private preprocessor: TextPreprocessor;

  constructor(preprocessor: TextPreprocessor) {
    this.preprocessor = preprocessor;
  }

  async trainModel(model: tf.LayersModel, trainingData: TrainingData[]): Promise<tf.History> {
    console.log(`Iniciando treinamento ultra-compacto com ${trainingData.length} amostras...`);

    // Verificar balanceamento do dataset
    const scores = trainingData.map(item => item.score);
    const lowCount = scores.filter(s => s <= 0.3).length;
    const midCount = scores.filter(s => s > 0.3 && s <= 0.7).length;
    const highCount = scores.filter(s => s > 0.7).length;
    
    console.log(`Dataset: ${lowCount} baixo, ${midCount} médio, ${highCount} alto`);
    
    if (lowCount > trainingData.length * 0.8) {
      console.warn('AVISO: Dataset muito desbalanceado! Maioria são scores baixos.');
    }

    let xs: tf.Tensor2D | null = null;
    let ys: tf.Tensor2D | null = null;

    try {
      // Preparar dados
      const sequences = trainingData.map(item => this.preprocessor.preprocessText(item.lyrics));
      const labels = trainingData.map(item => item.score);

      xs = tf.tensor2d(sequences);
      ys = tf.tensor2d(labels, [labels.length, 1]);

      console.log('Tensores criados:', xs.shape, ys.shape);

      // Treinamento com configurações para modelo pequeno
      const history = await model.fit(xs, ys, {
        epochs: 15, // Reduzido para modelo pequeno
        batchSize: Math.min(4, trainingData.length), // Batch size menor
        validationSplit: 0.2,
        verbose: 1,
        shuffle: true,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            const loss = logs?.loss?.toFixed(4) || 'N/A';
            const valLoss = logs?.val_loss?.toFixed(4) || 'N/A';
            const acc = logs?.accuracy?.toFixed(4) || 'N/A';
            console.log(`Época ${epoch + 1}: loss=${loss}, val_loss=${valLoss}, acc=${acc}`);
            
            // Early stopping para modelo pequeno
            if (logs?.val_loss && logs.val_loss > (logs.loss || 0) * 3) {
              console.log('Possível overfitting detectado em modelo pequeno');
            }
          }
        }
      });

      console.log('Treinamento concluído!');
      return history;

    } catch (error) {
      console.error('Erro durante treinamento:', error);
      throw error;
    } finally {
      // Cleanup obrigatório de memória
      if (xs) {
        xs.dispose();
        xs = null;
      }
      if (ys) {
        ys.dispose();
        ys = null;
      }
      
      // Forçar garbage collection
      if (tf.memory) {
        console.log('Memória TensorFlow antes do cleanup:', tf.memory());
      }
      tf.disposeVariables();
      
      if (typeof window !== 'undefined' && (window as any).gc) {
        (window as any).gc();
      }
    }
  }
}
