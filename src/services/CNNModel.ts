
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
  private vocabSize = 10000;

  constructor() {
    this.initializeTokenizer();
  }

  private initializeTokenizer() {
    // Vocabulário expandido para detecção de misoginia
    const misogynyWords = [
      // Termos explícitos de objetificação
      'bitch', 'bitches', 'slut', 'sluts', 'whore', 'whores', 'hoe', 'hoes', 'thot', 'thots',
      'skank', 'skanks', 'tramp', 'tramps', 'cunt', 'cunts', 'pussy', 'pussies',
      
      // Objetificação e propriedade
      'object', 'toy', 'property', 'belong', 'belongs', 'owns', 'owned', 'control', 'controls',
      'possess', 'possession', 'mine', 'my bitch', 'my ho', 'my girl',
      
      // Comandos de submissão
      'shut', 'quiet', 'silence', 'submit', 'submits', 'obey', 'obeys', 'kitchen', 'cook',
      'serve', 'serves', 'bow down', 'get down', 'on your knees',
      
      // Estereótipos negativos
      'weak', 'weaker', 'emotional', 'emotions', 'crazy', 'psycho', 'dramatic', 'drama',
      'irrational', 'stupid', 'dumb', 'blonde', 'airhead',
      
      // Exploração financeira/material
      'gold', 'digger', 'diggers', 'money', 'cash', 'pay', 'buy', 'purchase', 'shopping',
      'expensive', 'credit card', 'sugar daddy',
      
      // Manipulação e mentira
      'user', 'users', 'manipulative', 'manipulate', 'lying', 'lies', 'fake', 'faking',
      'pretend', 'pretends', 'trick', 'tricks', 'deceive', 'deceives',
      
      // Violência e agressão
      'hit', 'hits', 'slap', 'slaps', 'beat', 'beats', 'hurt', 'hurts', 'violence', 'violent',
      'force', 'forced', 'grab', 'grabs', 'choke', 'chokes', 'smack', 'smacks',
      
      // Termos sexuais objetificantes
      'fuck', 'fucked', 'fucking', 'fuckin', 'bang', 'banged', 'banging', 'smash', 'smashed',
      'pound', 'pounded', 'drill', 'drilled', 'nail', 'nailed', 'tap', 'tapped',
      'dick', 'cock', 'penis', 'balls', 'nuts', 'suck', 'sucked', 'sucking', 'blow',
      'tits', 'boobs', 'ass', 'butt', 'booty', 'pussy', 'vagina', 'clit',
      
      // Gírias contemporâneas
      'thirsty', 'basic', 'ratchet', 'ghetto', 'hood rat', 'side chick', 'main chick',
      'baby mama', 'baby momma', 'trap queen', 'ride or die', 'down ass bitch',
      
      // Redução a aparência física
      'hot', 'sexy', 'fine', 'thick', 'slim', 'skinny', 'fat', 'ugly', 'pretty face',
      'body', 'curves', 'shape', 'figure', 'legs', 'hips', 'waist',
      
      // Termos de controle e dominação
      'boss', 'master', 'daddy', 'pimp', 'player', 'mack', 'game', 'control',
      'handle', 'manage', 'train', 'break', 'tame', 'discipline',
      
      // Múltiplas parceiras (objetificação)
      'harem', 'rotation', 'options', 'backup', 'spare', 'collection', 'roster',
      'stable', 'team', 'crew', 'squad', 'girls', 'ladies', 'females',
      
      // Negação de valor além do sexual
      'only good for', 'just for', 'nothing but', 'all she is', 'worthless',
      'useless', 'good for nothing', 'waste', 'trash', 'garbage'
    ];

    // Palavras neutras e positivas para balanceamento
    const neutralWords = [
      'love', 'heart', 'beautiful', 'amazing', 'wonderful', 'awesome', 'great',
      'respect', 'equal', 'equality', 'partner', 'friend', 'support', 'care',
      'dream', 'hope', 'future', 'together', 'happiness', 'joy', 'peace',
      'music', 'song', 'dance', 'party', 'celebration', 'fun', 'good',
      'family', 'mother', 'father', 'sister', 'brother', 'home', 'life',
      'work', 'job', 'school', 'learn', 'study', 'book', 'read', 'write',
      'sun', 'moon', 'star', 'sky', 'earth', 'water', 'fire', 'air',
      'happy', 'smile', 'laugh', 'cry', 'feel', 'think', 'know', 'see'
    ];

    // Construir tokenizer
    let tokenIndex = 1; // 0 reservado para padding
    
    // Adicionar palavras misóginas com peso maior
    misogynyWords.forEach(word => {
      this.tokenizer.set(word.toLowerCase(), tokenIndex++);
    });
    
    // Adicionar palavras neutras
    neutralWords.forEach(word => {
      this.tokenizer.set(word.toLowerCase(), tokenIndex++);
    });

    console.log(`Tokenizer inicializado com ${this.tokenizer.size} palavras (${misogynyWords.length} misóginas, ${neutralWords.length} neutras)`);
  }

  async createModel(): Promise<void> {
    console.log('Criando modelo CNN aprimorado para detecção de misoginia...');

    this.model = tf.sequential({
      layers: [
        // Camada de embedding com dimensão maior
        tf.layers.embedding({
          inputDim: this.vocabSize,
          outputDim: 256,
          inputLength: this.maxSequenceLength,
          name: 'embedding'
        }),

        // Múltiplas camadas convolucionais para diferentes n-gramas
        tf.layers.conv1d({
          filters: 128,
          kernelSize: 2,
          activation: 'relu',
          name: 'conv1d_bigrams'
        }),
        tf.layers.maxPooling1d({ poolSize: 2, name: 'maxpool_bigrams' }),

        tf.layers.conv1d({
          filters: 128,
          kernelSize: 3,
          activation: 'relu',
          name: 'conv1d_trigrams'
        }),
        tf.layers.maxPooling1d({ poolSize: 2, name: 'maxpool_trigrams' }),

        tf.layers.conv1d({
          filters: 64,
          kernelSize: 4,
          activation: 'relu',
          name: 'conv1d_4grams'
        }),
        tf.layers.globalMaxPooling1d({ name: 'global_max_pooling' }),

        // Camadas densas com dropout para regularização
        tf.layers.dense({
          units: 256,
          activation: 'relu',
          name: 'dense_1'
        }),
        tf.layers.dropout({ rate: 0.5, name: 'dropout_1' }),
        
        tf.layers.dense({
          units: 128,
          activation: 'relu',
          name: 'dense_2'
        }),
        tf.layers.dropout({ rate: 0.3, name: 'dropout_2' }),
        
        tf.layers.dense({
          units: 64,
          activation: 'relu',
          name: 'dense_3'
        }),
        
        // Camada de saída (regressão - score 0 a 1)
        tf.layers.dense({
          units: 1,
          activation: 'sigmoid',
          name: 'output'
        })
      ]
    });

    // Compilar modelo com learning rate menor
    this.model.compile({
      optimizer: tf.train.adam(0.0005),
      loss: 'meanSquaredError',
      metrics: ['mae']
    });

    console.log('Modelo CNN aprimorado criado com sucesso!');
    console.log('Arquitetura do modelo:');
    this.model.summary();
  }

  private preprocessText(text: string): number[] {
    console.log('Preprocessando texto:', text.substring(0, 100) + '...');
    
    // Normalização mais robusta
    let normalizedText = text.toLowerCase()
      // Expandir contrações
      .replace(/fuckin'/g, 'fucking')
      .replace(/talkin'/g, 'talking')
      .replace(/nothin'/g, 'nothing')
      .replace(/somethin'/g, 'something')
      .replace(/\bho\b/g, 'whore')
      .replace(/\bu\b/g, 'you')
      .replace(/\bur\b/g, 'your')
      // Remover caracteres especiais mas manter espaços
      .replace(/[^\w\s]/g, ' ')
      // Normalizar espaços
      .replace(/\s+/g, ' ')
      .trim();

    const words = normalizedText.split(' ').filter(word => word.length > 0);
    console.log('Palavras extraídas:', words.slice(0, 20));

    const sequence: number[] = [];
    let recognizedWords = 0;
    
    words.forEach(word => {
      const tokenId = this.tokenizer.get(word);
      if (tokenId) {
        sequence.push(tokenId);
        recognizedWords++;
        console.log(`Palavra reconhecida: "${word}" -> token ${tokenId}`);
      } else {
        // Para palavras não reconhecidas, usar token especial
        sequence.push(1); // token para palavras desconhecidas
      }
    });

    console.log(`Reconhecidas ${recognizedWords} de ${words.length} palavras (${((recognizedWords/words.length)*100).toFixed(1)}%)`);

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

    console.log(`Iniciando treinamento aprimorado com ${trainingData.length} amostras...`);

    // Preparar dados de entrada
    const sequences = trainingData.map(item => this.preprocessText(item.lyrics));
    const labels = trainingData.map(item => item.score);

    const xs = tf.tensor2d(sequences);
    const ys = tf.tensor2d(labels, [labels.length, 1]);

    console.log('Tensores criados:');
    console.log('Input shape:', xs.shape);
    console.log('Output shape:', ys.shape);
    console.log('Labels range:', Math.min(...labels), 'to', Math.max(...labels));

    try {
      // Treinamento com mais épocas e early stopping
      const history = await this.model!.fit(xs, ys, {
        epochs: 100,
        batchSize: 16,
        validationSplit: 0.2,
        verbose: 1,
        shuffle: true,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            console.log(`Época ${epoch + 1}: loss = ${logs?.loss?.toFixed(4)}, val_loss = ${logs?.val_loss?.toFixed(4)}, mae = ${logs?.mae?.toFixed(4)}`);
          }
        }
      });

      console.log('Treinamento aprimorado concluído!');
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

    console.log('=== PREDIÇÃO DETALHADA ===');
    console.log('Texto original:', lyrics.substring(0, 200) + '...');

    const sequence = this.preprocessText(lyrics);
    console.log('Sequência processada (primeiros 20 tokens):', sequence.slice(0, 20));
    
    const inputTensor = tf.tensor2d([sequence]);

    try {
      const prediction = this.model.predict(inputTensor) as tf.Tensor;
      const scoreArray = await prediction.data();
      const rawScore = scoreArray[0];
      
      console.log('Score bruto do modelo:', rawScore);
      
      // Normalizar score
      const normalizedScore = Math.max(0, Math.min(1, rawScore));
      
      // Calcular confiança baseada na distância dos extremos
      const confidence = Math.min(1, Math.abs(normalizedScore - 0.5) * 2 + 0.1);

      // Determinar categoria com thresholds ajustados
      let category: 'baixo' | 'medio' | 'alto';
      if (normalizedScore <= 0.3) {
        category = 'baixo';
      } else if (normalizedScore <= 0.7) {
        category = 'medio';
      } else {
        category = 'alto';
      }

      console.log(`Score normalizado: ${normalizedScore.toFixed(3)}`);
      console.log(`Confiança: ${confidence.toFixed(3)}`);
      console.log(`Categoria: ${category}`);
      console.log('=== FIM PREDIÇÃO ===');

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
    console.log(`Modelo aprimorado salvo em: ${path}`);
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
      architecture: 'CNN Multi-layer Enhanced',
      vocabSize: this.vocabSize,
      maxSequenceLength: this.maxSequenceLength,
      tokenizerSize: this.tokenizer.size
    };
  }
}

// Instância singleton do modelo
export const cnnModel = new MisogynyCNNModel();
