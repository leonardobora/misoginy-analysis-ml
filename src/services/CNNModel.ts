import * as tf from '@tensorflow/tfjs';

export interface PredictionResult {
  score: number;
  confidence: number;
  category: 'baixo' | 'medio' | 'alto';
}

export class MisogynyCNNModel {
  private model: tf.LayersModel | null = null;
  private tokenizer: Map<string, number> = new Map();
  private maxSequenceLength = 50; // Reduzido de 100
  private vocabSize = 1000; // Reduzido drasticamente de 5000

  constructor() {
    this.initializeTokenizer();
  }

  private initializeTokenizer() {
    // Vocabulário ultra-focado apenas nos termos mais críticos
    const criticalWords = [
      // Termos explícitos mais comuns
      'bitch', 'bitches', 'slut', 'sluts', 'whore', 'whores', 'hoe', 'hoes',
      'skank', 'cunt', 'pussy', 'fuckin', 'fucking', 'fuck',
      
      // Objetificação básica
      'object', 'toy', 'belong', 'owned', 'control', 'mine',
      
      // Comandos básicos
      'shut', 'quiet', 'submit', 'kitchen', 'serve',
      
      // Estereótipos comuns
      'weak', 'crazy', 'stupid', 'dumb', 'emotional',
      
      // Sexuais objetificantes
      'bang', 'smash', 'pound', 'drill', 'dick', 'cock',
      'suck', 'blow', 'tits', 'boobs', 'ass',
      
      // Gírias contemporâneas
      'basic', 'ratchet', 'thot', 'side', 'main',
      
      // Controle/dominação
      'daddy', 'pimp', 'player', 'handle', 'train',
      
      // Desvalorização
      'worthless', 'useless', 'trash', 'nothing'
    ];

    // Palavras neutras mínimas para balanceamento
    const neutralWords = [
      'love', 'heart', 'beautiful', 'amazing', 'great', 'respect',
      'equal', 'partner', 'friend', 'support', 'care', 'happy',
      'music', 'song', 'dance', 'family', 'home', 'life', 'good'
    ];

    // Construir tokenizer compacto
    let tokenIndex = 2; // 0=padding, 1=unknown
    
    criticalWords.forEach(word => {
      this.tokenizer.set(word.toLowerCase(), tokenIndex++);
    });
    
    neutralWords.forEach(word => {
      this.tokenizer.set(word.toLowerCase(), tokenIndex++);
    });

    console.log(`Tokenizer ultra-compacto inicializado com ${this.tokenizer.size} palavras`);
  }

  async createModel(): Promise<void> {
    console.log('Criando modelo CNN ultra-compacto...');

    // Arquitetura minimalista para evitar problemas de memória
    this.model = tf.sequential({
      layers: [
        // Embedding muito pequeno
        tf.layers.embedding({
          inputDim: this.vocabSize,
          outputDim: 32, // Drasticamente reduzido de 128
          inputLength: this.maxSequenceLength,
          name: 'embedding'
        }),

        // Uma única camada convolucional minimalista
        tf.layers.conv1d({
          filters: 16, // Reduzido de 64
          kernelSize: 3,
          activation: 'relu',
          name: 'conv1d_main'
        }),
        tf.layers.maxPooling1d({ poolSize: 2, name: 'maxpool_main' }),

        // Global pooling
        tf.layers.globalMaxPooling1d({ name: 'global_pooling' }),

        // Camadas densas ultra-compactas
        tf.layers.dense({
          units: 16, // Reduzido de 64
          activation: 'relu',
          name: 'dense_1'
        }),
        tf.layers.dropout({ rate: 0.2, name: 'dropout_1' }),
        
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
      optimizer: tf.train.adam(0.001),
      loss: 'binaryCrossentropy',
      metrics: ['accuracy']
    });

    console.log('Modelo CNN ultra-compacto criado!');
    console.log(`Parâmetros totais: ${this.model.countParams()}`);
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

    // Padding/truncamento para sequência menor
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
      const sequences = trainingData.map(item => this.preprocessText(item.lyrics));
      const labels = trainingData.map(item => item.score);

      xs = tf.tensor2d(sequences);
      ys = tf.tensor2d(labels, [labels.length, 1]);

      console.log('Tensores criados:', xs.shape, ys.shape);

      // Treinamento com configurações para modelo pequeno
      const history = await this.model!.fit(xs, ys, {
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

  async predict(lyrics: string): Promise<PredictionResult> {
    if (!this.model) {
      throw new Error('Modelo não foi criado. Execute createModel() primeiro.');
    }

    console.log('=== PREDIÇÃO ULTRA-COMPACTA ===');
    
    const sequence = this.preprocessText(lyrics);
    const inputTensor = tf.tensor2d([sequence]);
    let prediction: tf.Tensor | undefined;

    try {
      prediction = this.model.predict(inputTensor) as tf.Tensor;
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

  async saveModel(path: string = 'localstorage://misogyny-cnn-ultra-compact'): Promise<void> {
    if (!this.model) {
      throw new Error('Modelo não foi criado.');
    }

    try {
      // Verificar tamanho do modelo antes de salvar
      const modelSize = this.model.countParams();
      console.log(`Tentando salvar modelo com ${modelSize} parâmetros`);
      
      await this.model.save(path);
      console.log(`Modelo ultra-compacto salvo com sucesso em: ${path}`);
    } catch (error) {
      console.error('Erro ao salvar modelo:', error);
      
      // Tentar salvar com nome diferente em caso de erro
      const fallbackPath = 'localstorage://misogyny-cnn-mini';
      try {
        await this.model.save(fallbackPath);
        console.log(`Modelo salvo em caminho alternativo: ${fallbackPath}`);
      } catch (fallbackError) {
        console.error('Falha também no caminho alternativo:', fallbackError);
        throw new Error('Não foi possível salvar o modelo. Modelo muito grande para localStorage.');
      }
    }
  }

  async loadModel(path: string = 'localstorage://misogyny-cnn-ultra-compact'): Promise<void> {
    try {
      this.model = await tf.loadLayersModel(path);
      console.log(`Modelo carregado de: ${path}`);
    } catch (error) {
      console.log('Modelo não encontrado, tentando caminho alternativo...');
      try {
        this.model = await tf.loadLayersModel('localstorage://misogyny-cnn-mini');
        console.log('Modelo carregado do caminho alternativo');
      } catch (fallbackError) {
        console.log('Nenhum modelo encontrado, criando novo...');
        await this.createModel();
      }
    }
  }

  getModelInfo() {
    if (!this.model) {
      return null;
    }

    return {
      totalParams: this.model.countParams(),
      layers: this.model.layers.length,
      architecture: 'CNN Ultra-Compact',
      vocabSize: this.vocabSize,
      maxSequenceLength: this.maxSequenceLength,
      tokenizerSize: this.tokenizer.size
    };
  }
}

// Instância singleton
export const cnnModel = new MisogynyCNNModel();
