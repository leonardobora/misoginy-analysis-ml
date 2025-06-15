
import * as tf from '@tensorflow/tfjs';
import { PredictionResult, ModelInfo, TrainingData } from '../types/ModelTypes';
import { TextPreprocessor } from './TextPreprocessor';
import { ModelArchitecture } from './ModelArchitecture';
import { ModelTrainer } from './ModelTrainer';
import { ModelPredictor } from './ModelPredictor';
import { ModelStorage } from './ModelStorage';

export class MisogynyCNNModel {
  private model: tf.LayersModel | null = null;
  private preprocessor: TextPreprocessor;
  private trainer: ModelTrainer;
  private predictor: ModelPredictor;

  constructor() {
    this.preprocessor = new TextPreprocessor();
    this.trainer = new ModelTrainer(this.preprocessor);
    this.predictor = new ModelPredictor(this.preprocessor);
  }

  async createModel(): Promise<void> {
    this.model = ModelArchitecture.createModel(
      this.preprocessor.getVocabSize(),
      this.preprocessor.getMaxSequenceLength()
    );
  }

  async trainWithData(trainingData: TrainingData[]): Promise<tf.History> {
    if (!this.model) {
      await this.createModel();
    }

    return this.trainer.trainModel(this.model!, trainingData);
  }

  async predict(lyrics: string): Promise<PredictionResult> {
    if (!this.model) {
      throw new Error('Modelo não foi criado. Execute createModel() primeiro.');
    }

    return this.predictor.predict(this.model, lyrics);
  }

  async saveModel(path?: string): Promise<void> {
    if (!this.model) {
      throw new Error('Modelo não foi criado.');
    }

    return ModelStorage.saveModel(this.model, path);
  }

  async loadModel(path?: string): Promise<void> {
    const loadedModel = await ModelStorage.loadModel(path);
    if (loadedModel) {
      this.model = loadedModel;
    } else {
      console.log('Nenhum modelo encontrado, criando novo...');
      await this.createModel();
    }
  }

  getModelInfo(): ModelInfo | null {
    if (!this.model) {
      return null;
    }

    return {
      totalParams: this.model.countParams(),
      layers: this.model.layers.length,
      architecture: 'CNN Ultra-Compact',
      vocabSize: this.preprocessor.getVocabSize(),
      maxSequenceLength: this.preprocessor.getMaxSequenceLength(),
      tokenizerSize: this.preprocessor.getTokenizerSize()
    };
  }
}

// Instância singleton
export const cnnModel = new MisogynyCNNModel();
