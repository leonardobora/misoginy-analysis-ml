import * as tf from '@tensorflow/tfjs';

export interface PredictionResult {
  score: number;
  confidence: number;
  category: 'baixo' | 'medio' | 'alto';
}

export class MisogynyCNNModel {
  private model: tf.LayersModel | null = null;
  private tokenizer: Map<string, number> = new Map();
  private maxSequenceLength = 100;
  private vocabSize = 5000;

  constructor() {
    this.initializeTokenizer();
  }

  private initializeTokenizer() {
    // Palavras relacionadas à misoginia e contexto negativo
    const negativeWords = [
      'bitch', 'slut', 'whore', 'hoe', 'thot', 'skank', 'tramp',
      'object', 'toy', 'property', 'belong', 'owns', 'control',
      'shut', 'quiet', 'silence', 'submit', 'obey', 'kitchen',
      'weak', 'emotional', 'crazy', 'psycho', 'dramatic',
      'gold', 'digger', 'user', 'manipulative', 'lying',
      'hit', 'slap', 'beat', 'hurt', 'violence', 'force'
    ];

    // Palavras neutras e positivas
    const neutralWords = [
      'love', 'heart', 'beautiful', 'amazing', 'wonderful',
      'respect', 'equal', 'partner', 'friend', 'support',
      'dream', 'hope', 'future', 'together', 'happiness',
      'music', 'song', 'dance', 'party', 'celebration'
    ];

    // Construir tokenizer básico
    let tokenIndex = 1; // 0 reservado para padding
    
    [...negativeWords, ...neutralWords].forEach(word => {
      this.tokenizer.set(word.toLowerCase(), tokenIndex++);
    });
  }

  async createModel(): Promise<void> {
    console.log('Criando modelo CNN para detecção de misoginia...');

    this.model = tf.sequential({
      layers: [
        // Camada de embedding
        tf.layers.embedding({
          inputDim: this.vocabSize,
          outputDim: 128,
          inputLength: this.maxSequenceLength,
          name: 'embedding'
        }),

        // Camadas convolucionais
        tf.layers.conv1d({
          filters: 64,
          kernelSize: 3,
          activation: 'relu',
          name: 'conv1d_1'
        }),
        tf.layers.globalMaxPooling1d({ name: 'global_max_pooling' }),

        // Camadas densas
        tf.layers.dense({
          units: 128,
          activation: 'relu',
          name: 'dense_1'
        }),
        tf.layers.dropout({ rate: 0.5, name: 'dropout' }),
        tf.layers.dense({
          units: 64,
          activation: 'relu',
          name: 'dense_2'
        }),
        
        // Camada de saída (regressão - score 0 a 1)
        tf.layers.dense({
          units: 1,
          activation: 'sigmoid',
          name: 'output'
        })
      ]
    });

    // Compilar modelo
    this.model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError',
      metrics: ['mae']
    });

    console.log('Modelo CNN criado com sucesso!');
    console.log('Arquitetura do modelo:');
    this.model.summary();
  }

  private preprocessText(text: string): number[] {
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 0);

    const sequence: number[] = [];
    
    words.forEach(word => {
      const tokenId = this.tokenizer.get(word) || 0;
      if (tokenId > 0) {
        sequence.push(tokenId);
      }
    });

    // Padding ou truncamento para tamanho fixo
    if (sequence.length > this.maxSequenceLength) {
      return sequence.slice(0, this.maxSequenceLength);
    } else {
      return [...sequence, ...Array(this.maxSequenceLength - sequence.length).fill(0)];
    }
  }

  async trainWithData(trainingData: Array<{ lyrics: string; score: number }>): Promise<tf.History> {
    if (!this.model) {
      await this.createModel();
    }

    console.log(`Iniciando treinamento com ${trainingData.length} amostras...`);

    // Preparar dados de entrada
    const sequences = trainingData.map(item => this.preprocessText(item.lyrics));
    const labels = trainingData.map(item => item.score);

    const xs = tf.tensor2d(sequences);
    const ys = tf.tensor2d(labels, [labels.length, 1]);

    console.log('Tensores criados:');
    console.log('Input shape:', xs.shape);
    console.log('Output shape:', ys.shape);

    try {
      // Treinamento
      const history = await this.model!.fit(xs, ys, {
        epochs: 50,
        batchSize: 32,
        validationSplit: 0.2,
        verbose: 1,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            console.log(`Época ${epoch + 1}: loss = ${logs?.loss?.toFixed(4)}, val_loss = ${logs?.val_loss?.toFixed(4)}`);
          }
        }
      });

      console.log('Treinamento concluído!');
      return history;
    } finally {
      // Limpar memória
      xs.dispose();
      ys.dispose();
    }
  }

  async predict(lyrics: string): Promise<PredictionResult> {
    if (!this.model) {
      throw new Error('Modelo não foi criado. Execute createModel() primeiro.');
    }

    const sequence = this.preprocessText(lyrics);
    const inputTensor = tf.tensor2d([sequence]);

    try {
      const prediction = this.model.predict(inputTensor) as tf.Tensor;
      const score = await prediction.data();
      const normalizedScore = Math.max(0, Math.min(1, score[0]));

      // Calcular confiança baseada na distância dos extremos
      const confidence = Math.abs(normalizedScore - 0.5) * 2;

      // Determinar categoria
      let category: 'baixo' | 'medio' | 'alto';
      if (normalizedScore <= 0.33) {
        category = 'baixo';
      } else if (normalizedScore <= 0.66) {
        category = 'medio';
      } else {
        category = 'alto';
      }

      prediction.dispose();

      return {
        score: normalizedScore,
        confidence: confidence,
        category: category
      };
    } finally {
      inputTensor.dispose();
    }
  }

  async saveModel(path: string = 'localstorage://misogyny-cnn-model'): Promise<void> {
    if (!this.model) {
      throw new Error('Modelo não foi criado.');
    }

    await this.model.save(path);
    console.log(`Modelo salvo em: ${path}`);
  }

  async loadModel(path: string = 'localstorage://misogyny-cnn-model'): Promise<void> {
    try {
      this.model = await tf.loadLayersModel(path);
      console.log(`Modelo carregado de: ${path}`);
    } catch (error) {
      console.log('Modelo não encontrado, será necessário treinar um novo.');
      await this.createModel();
    }
  }

  getModelInfo() {
    if (!this.model) {
      return null;
    }

    return {
      totalParams: this.model.countParams(),
      layers: this.model.layers.length,
      architecture: 'CNN Multi-label',
      vocabSize: this.vocabSize,
      maxSequenceLength: this.maxSequenceLength
    };
  }
}

// Instância singleton do modelo
export const cnnModel = new MisogynyCNNModel();
