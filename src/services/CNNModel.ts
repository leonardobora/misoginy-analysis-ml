
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
  private vocabSize = 5000; // Reduzido para ser mais gerenciável

  constructor() {
    this.initializeTokenizer();
  }

  private initializeTokenizer() {
    // Vocabulário focado e balanceado para detecção de misoginia
    const misogynyWords = [
      // Termos explícitos mais comuns
      'bitch', 'bitches', 'slut', 'sluts', 'whore', 'whores', 'hoe', 'hoes', 'thot',
      'skank', 'tramp', 'cunt', 'pussy', 'fuckin', 'fucking', 'fuck', 'fucked',
      
      // Objetificação
      'object', 'toy', 'belong', 'owns', 'owned', 'control', 'possess', 'mine',
      
      // Comandos/submissão
      'shut', 'quiet', 'submit', 'obey', 'kitchen', 'serve', 'bow',
      
      // Estereótipos
      'weak', 'emotional', 'crazy', 'psycho', 'dramatic', 'irrational', 'stupid', 'dumb',
      
      // Sexuais objetificantes
      'bang', 'banged', 'smash', 'pound', 'drill', 'nail', 'tap', 'dick', 'cock',
      'suck', 'blow', 'tits', 'boobs', 'ass', 'booty',
      
      // Gírias contemporâneas
      'thirsty', 'basic', 'ratchet', 'hood', 'trap', 'side', 'main',
      
      // Controle/dominação
      'boss', 'master', 'daddy', 'pimp', 'player', 'handle', 'manage', 'train', 'break',
      
      // Múltiplas parceiras
      'rotation', 'options', 'backup', 'collection', 'roster', 'stable',
      
      // Desvalorização
      'worthless', 'useless', 'trash', 'garbage', 'nothing'
    ];

    // Palavras neutras para balanceamento
    const neutralWords = [
      'love', 'heart', 'beautiful', 'amazing', 'wonderful', 'great', 'respect',
      'equal', 'partner', 'friend', 'support', 'care', 'dream', 'hope', 'future',
      'together', 'happiness', 'joy', 'peace', 'music', 'song', 'dance', 'party',
      'family', 'mother', 'father', 'home', 'life', 'work', 'school', 'learn',
      'happy', 'smile', 'laugh', 'feel', 'think', 'know', 'see', 'good', 'nice'
    ];

    // Construir tokenizer
    let tokenIndex = 2; // 0=padding, 1=unknown
    
    misogynyWords.forEach(word => {
      this.tokenizer.set(word.toLowerCase(), tokenIndex++);
    });
    
    neutralWords.forEach(word => {
      this.tokenizer.set(word.toLowerCase(), tokenIndex++);
    });

    console.log(`Tokenizer inicializado com ${this.tokenizer.size} palavras`);
  }

  async createModel(): Promise<void> {
    console.log('Criando modelo CNN simplificado...');

    // Arquitetura simplificada para dataset pequeno
    this.model = tf.sequential({
      layers: [
        // Embedding menor
        tf.layers.embedding({
          inputDim: this.vocabSize,
          outputDim: 128, // Reduzido de 256
          inputLength: this.maxSequenceLength,
          name: 'embedding'
        }),

        // Uma única camada convolucional
        tf.layers.conv1d({
          filters: 64, // Reduzido de 128
          kernelSize: 3,
          activation: 'relu',
          name: 'conv1d_main'
        }),
        tf.layers.maxPooling1d({ poolSize: 2, name: 'maxpool_main' }),

        // Global pooling
        tf.layers.globalMaxPooling1d({ name: 'global_pooling' }),

        // Camadas densas simplificadas
        tf.layers.dense({
          units: 64, // Reduzido de 256
          activation: 'relu',
          name: 'dense_1'
        }),
        tf.layers.dropout({ rate: 0.3, name: 'dropout_1' }), // Reduzido de 0.5
        
        tf.layers.dense({
          units: 32, // Reduzido de 128
          activation: 'relu',
          name: 'dense_2'
        }),
        tf.layers.dropout({ rate: 0.2, name: 'dropout_2' }), // Reduzido de 0.3
        
        // Saída
        tf.layers.dense({
          units: 1,
          activation: 'sigmoid',
          name: 'output'
        })
      ]
    });

    // Configuração otimizada
    this.model.compile({
      optimizer: tf.train.adam(0.001), // Learning rate padrão
      loss: 'binaryCrossentropy', // Melhor para classificação binária
      metrics: ['accuracy']
    });

    console.log('Modelo CNN simplificado criado!');
    this.model.summary();
  }

  private preprocessText(text: string): number[] {
    console.log('Preprocessando texto...');
    
    // Normalização robusta
    let normalizedText = text.toLowerCase()
      .replace(/fuckin'/g, 'fucking')
      .replace(/\bho\b/g, 'whore')
      .replace(/\bu\b/g, 'you')
      .replace(/\bur\b/g, 'your')
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const words = normalizedText.split(' ').filter(word => word.length > 0);
    console.log(`Processando ${words.length} palavras`);

    const sequence: number[] = [];
    let recognizedWords = 0;
    
    words.forEach(word => {
      const tokenId = this.tokenizer.get(word);
      if (tokenId) {
        sequence.push(tokenId);
        recognizedWords++;
      } else {
        sequence.push(1); // Token para palavras desconhecidas
      }
    });

    const recognitionRate = (recognizedWords / words.length) * 100;
    console.log(`Taxa de reconhecimento: ${recognitionRate.toFixed(1)}%`);

    // Padding/truncamento
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
      const sequences = trainingData.map(item => this.preprocessText(item.lyrics));
      const labels = trainingData.map(item => item.score);

      xs = tf.tensor2d(sequences);
      ys = tf.tensor2d(labels, [labels.length, 1]);

      console.log('Tensores criados:', xs.shape, ys.shape);

      // Treinamento com configurações ajustadas
      const history = await this.model!.fit(xs, ys, {
        epochs: 20, // Reduzido para evitar overfitting
        batchSize: Math.min(8, trainingData.length), // Batch size adaptativo
        validationSplit: 0.2,
        verbose: 1,
        shuffle: true,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            const loss = logs?.loss?.toFixed(4) || 'N/A';
            const valLoss = logs?.val_loss?.toFixed(4) || 'N/A';
            const acc = logs?.accuracy?.toFixed(4) || 'N/A';
            console.log(`Época ${epoch + 1}: loss=${loss}, val_loss=${valLoss}, acc=${acc}`);
            
            // Early stopping simples
            if (logs?.val_loss && logs.val_loss > (logs.loss || 0) * 2) {
              console.log('Possível overfitting detectado');
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
      if (xs) xs.dispose();
      if (ys) ys.dispose();
      
      // Forçar garbage collection se disponível
      if (typeof window !== 'undefined' && (window as any).gc) {
        (window as any).gc();
      }
    }
  }

  async predict(lyrics: string): Promise<PredictionResult> {
    if (!this.model) {
      throw new Error('Modelo não foi criado. Execute createModel() primeiro.');
    }

    console.log('=== PREDIÇÃO ===');
    
    const sequence = this.preprocessText(lyrics);
    const inputTensor = tf.tensor2d([sequence]);

    try {
      const prediction = this.model.predict(inputTensor) as tf.Tensor;
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

  async saveModel(path: string = 'localstorage://misogyny-cnn-simplified'): Promise<void> {
    if (!this.model) {
      throw new Error('Modelo não foi criado.');
    }

    await this.model.save(path);
    console.log(`Modelo salvo em: ${path}`);
  }

  async loadModel(path: string = 'localstorage://misogyny-cnn-simplified'): Promise<void> {
    try {
      this.model = await tf.loadLayersModel(path);
      console.log(`Modelo carregado de: ${path}`);
    } catch (error) {
      console.log('Modelo não encontrado, criando novo...');
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
      architecture: 'CNN Simplified',
      vocabSize: this.vocabSize,
      maxSequenceLength: this.maxSequenceLength,
      tokenizerSize: this.tokenizer.size
    };
  }
}

// Instância singleton
export const cnnModel = new MisogynyCNNModel();
