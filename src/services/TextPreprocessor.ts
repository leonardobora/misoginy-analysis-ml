
/**
 * TextPreprocessor - Pré-processamento de texto aprimorado
 * Compatível com o modelo CNN expandido (5K vocab, 100 tokens)
 */

import { ModelArchitecture } from './ModelArchitecture';

export interface ProcessingConfig {
  vocabSize: number;
  maxSequenceLength: number;
  minWordFreq: number;
  removeStopWords: boolean;
  normalizeCasing: boolean;
}

export interface ProcessedText {
  tokens: number[];
  originalLength: number;
  processedLength: number;
  vocabularyUsed: number;
  oovCount: number; // Out-of-vocabulary count
}

export class TextPreprocessor {
  private vocabulary: Map<string, number> = new Map();
  private reverseVocabulary: Map<number, string> = new Map();
  private wordFrequencies: Map<string, number> = new Map();
  private config: ProcessingConfig;
  private isBuilt = false;

  // Configuração padrão sincronizada com ModelArchitecture
  constructor(config?: Partial<ProcessingConfig>) {
    this.config = {
      vocabSize: ModelArchitecture.VOCAB_SIZE, // 5000
      maxSequenceLength: ModelArchitecture.MAX_SEQUENCE_LENGTH, // 100
      minWordFreq: 2, // Mínimo de 2 ocorrências
      removeStopWords: true,
      normalizeCasing: true,
      ...config
    };

    console.log('📝 TextPreprocessor inicializado:', this.config);
  }

  /**
   * Stopwords em português e inglês (expandida)
   */
  private readonly stopWords = new Set([
    // Português
    'a', 'o', 'e', 'é', 'de', 'do', 'da', 'em', 'um', 'uma', 'para', 'com', 'não', 'na', 'no', 'se', 'que', 'como', 'mais', 'por', 'mas', 'dos', 'das', 'te', 'me', 'você', 'ele', 'ela', 'seu', 'sua', 'isso', 'essa', 'este', 'esta', 'foi', 'ser', 'ter', 'bem', 'já', 'só', 'até', 'muito', 'quando', 'onde', 'então', 'assim', 'vai', 'vou', 'pode', 'faz', 'fica', 'está', 'estou', 'são', 'tem', 'teu', 'meu', 'nos', 'nós', 'eles', 'elas',
    
    // Inglês
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'cannot', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'her', 'its', 'our', 'their', 'this', 'that', 'these', 'those', 'what', 'where', 'when', 'why', 'how', 'all', 'some', 'any', 'no', 'not', 'only', 'just', 'very', 'so', 'too', 'now', 'then', 'here', 'there', 'up', 'down', 'out', 'off', 'over', 'under', 'again', 'once', 'more', 'most', 'other', 'another', 'such', 'like', 'than', 'also', 'even', 'well', 'still', 'back', 'just', 'way', 'get', 'go', 'come', 'know', 'see', 'look', 'want', 'take', 'give', 'say', 'tell', 'think', 'feel', 'make', 'let', 'put', 'keep', 'find', 'turn', 'ask', 'try', 'need', 'work', 'call', 'use', 'help', 'start', 'show', 'hear', 'play', 'run', 'move', 'live', 'believe', 'hold', 'bring', 'happen', 'write', 'sit', 'stand', 'lose', 'pay', 'meet', 'include', 'continue', 'set', 'learn', 'change', 'lead', 'understand', 'watch', 'follow', 'stop', 'create', 'speak', 'read', 'spend', 'grow', 'open', 'walk', 'win', 'teach', 'offer', 'remember', 'consider', 'appear', 'buy', 'serve', 'die', 'send', 'build', 'stay', 'fall', 'cut', 'reach', 'kill', 'remain'
  ]);

  /**
   * Construir vocabulário a partir de textos de treinamento
   */
  buildVocabulary(texts: string[]): void {
    console.log('🔨 Construindo vocabulário...');
    
    this.wordFrequencies.clear();
    
    // Contar frequências de palavras
    for (const text of texts) {
      const words = this.tokenize(text);
      for (const word of words) {
        this.wordFrequencies.set(word, (this.wordFrequencies.get(word) || 0) + 1);
      }
    }

    // Filtrar palavras por frequência mínima
    const validWords = Array.from(this.wordFrequencies.entries())
      .filter(([_, freq]) => freq >= this.config.minWordFreq)
      .sort(([_, a], [__, b]) => b - a) // Ordenar por frequência
      .slice(0, this.config.vocabSize - 2); // Reservar espaço para tokens especiais

    // Construir vocabulário
    this.vocabulary.clear();
    this.reverseVocabulary.clear();
    
    // Tokens especiais
    this.vocabulary.set('<PAD>', 0);
    this.vocabulary.set('<UNK>', 1);
    this.reverseVocabulary.set(0, '<PAD>');
    this.reverseVocabulary.set(1, '<UNK>');

    // Adicionar palavras válidas
    validWords.forEach(([word, _], index) => {
      const tokenId = index + 2;
      this.vocabulary.set(word, tokenId);
      this.reverseVocabulary.set(tokenId, word);
    });

    this.isBuilt = true;
    
    console.log(`✅ Vocabulário construído:`);
    console.log(`📊 Tamanho: ${this.vocabulary.size} palavras`);
    console.log(`📈 Frequência mínima: ${this.config.minWordFreq}`);
    console.log(`🔤 Palavras mais comuns:`, validWords.slice(0, 10).map(([word, freq]) => `${word}(${freq})`));
  }

  /**
   * Tokenização aprimorada
   */
  private tokenize(text: string): string[] {
    let processed = text;

    // Normalização de casing
    if (this.config.normalizeCasing) {
      processed = processed.toLowerCase();
    }

    // Limpar texto
    processed = processed
      .replace(/[^\w\s\-']/g, ' ') // Manter apenas palavras, espaços, hífens e apostrofes
      .replace(/\s+/g, ' ') // Normalizar espaços
      .trim();

    // Dividir em palavras
    let words = processed.split(' ').filter(word => word.length > 0);

    // Remover stopwords se configurado
    if (this.config.removeStopWords) {
      words = words.filter(word => !this.stopWords.has(word));
    }

    // Filtrar palavras muito curtas ou muito longas
    words = words.filter(word => word.length >= 2 && word.length <= 20);

    return words;
  }

  /**
   * Processar texto para sequência de tokens
   */
  processText(text: string): ProcessedText {
    if (!this.isBuilt) {
      throw new Error('Vocabulário não foi construído. Chame buildVocabulary() primeiro.');
    }

    const words = this.tokenize(text);
    const tokens: number[] = [];
    let oovCount = 0;

    // Converter palavras para tokens
    for (const word of words) {
      const tokenId = this.vocabulary.get(word);
      if (tokenId !== undefined) {
        tokens.push(tokenId);
      } else {
        tokens.push(1); // <UNK>
        oovCount++;
      }
    }

    // Aplicar padding/truncation
    let processedTokens: number[];
    if (tokens.length > this.config.maxSequenceLength) {
      // Truncar mantendo as palavras mais importantes (início e fim)
      const halfLength = Math.floor(this.config.maxSequenceLength / 2);
      processedTokens = [
        ...tokens.slice(0, halfLength),
        ...tokens.slice(tokens.length - halfLength)
      ];
    } else {
      // Padding com zeros
      processedTokens = [
        ...tokens,
        ...Array(this.config.maxSequenceLength - tokens.length).fill(0)
      ];
    }

    return {
      tokens: processedTokens,
      originalLength: words.length,
      processedLength: tokens.length,
      vocabularyUsed: new Set(tokens.filter(t => t > 1)).size,
      oovCount
    };
  }

  /**
   * Processar lote de textos
   */
  processBatch(texts: string[]): ProcessedText[] {
    return texts.map(text => this.processText(text));
  }

  /**
   * Converter tokens de volta para texto (para debug)
   */
  tokensToText(tokens: number[]): string {
    return tokens
      .filter(token => token > 0) // Remover padding
      .map(token => this.reverseVocabulary.get(token) || '<UNK>')
      .join(' ');
  }

  // === MÉTODOS DE COMPATIBILIDADE COM CÓDIGO EXISTENTE ===

  /**
   * Método de compatibilidade com a interface anterior
   */
  preprocessText(text: string): number[] {
    if (!this.isBuilt) {
      // Se não foi construído, usar vocabulário básico
      this.buildBasicVocabulary();
    }
    
    const processed = this.processText(text);
    return processed.tokens;
  }

  /**
   * Construir vocabulário básico para compatibilidade
   */
  private buildBasicVocabulary(): void {
    console.log('🔧 Construindo vocabulário básico para compatibilidade...');
    
    // Vocabulário crítico para detecção de misoginia
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

    // Palavras neutras para balanceamento
    const neutralWords = [
      'love', 'heart', 'beautiful', 'amazing', 'great', 'respect',
      'equal', 'partner', 'friend', 'support', 'care', 'happy',
      'music', 'song', 'dance', 'family', 'home', 'life', 'good'
    ];

    // Construir vocabulário básico
    this.vocabulary.clear();
    this.reverseVocabulary.clear();
    
    this.vocabulary.set('<PAD>', 0);
    this.vocabulary.set('<UNK>', 1);
    this.reverseVocabulary.set(0, '<PAD>');
    this.reverseVocabulary.set(1, '<UNK>');

    let tokenIndex = 2;
    
    [...criticalWords, ...neutralWords].forEach(word => {
      this.vocabulary.set(word.toLowerCase(), tokenIndex);
      this.reverseVocabulary.set(tokenIndex, word.toLowerCase());
      tokenIndex++;
    });

    this.isBuilt = true;
    console.log(`✅ Vocabulário básico: ${this.vocabulary.size} palavras`);
  }

  /**
   * Métodos de compatibilidade
   */
  getVocabSize(): number {
    return this.config.vocabSize;
  }

  getMaxSequenceLength(): number {
    return this.config.maxSequenceLength;
  }

  getTokenizerSize(): number {
    return this.vocabulary.size;
  }

  /**
   * Obter estatísticas do vocabulário
   */
  getVocabularyStats() {
    const totalWords = this.wordFrequencies.size;
    const validWords = Array.from(this.wordFrequencies.values())
      .filter(freq => freq >= this.config.minWordFreq).length;
    
    return {
      totalWords,
      validWords,
      vocabularySize: this.vocabulary.size,
      avgFrequency: totalWords > 0 ? 
        Array.from(this.wordFrequencies.values()).reduce((a, b) => a + b, 0) / totalWords : 0,
      maxFrequency: totalWords > 0 ? Math.max(...Array.from(this.wordFrequencies.values())) : 0,
      minFrequency: this.config.minWordFreq
    };
  }

  /**
   * Verificar se está pronto para uso
   */
  isReady(): boolean {
    return this.isBuilt && this.vocabulary.size > 2;
  }

  /**
   * Obter configuração atual
   */
  getConfig(): ProcessingConfig {
    return { ...this.config };
  }
}
