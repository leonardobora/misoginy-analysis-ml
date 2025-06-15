
export class TextPreprocessor {
  private tokenizer: Map<string, number> = new Map();
  private readonly maxSequenceLength = 50;
  private readonly vocabSize = 1000;

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

  preprocessText(text: string): number[] {
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

  getVocabSize(): number {
    return this.vocabSize;
  }

  getMaxSequenceLength(): number {
    return this.maxSequenceLength;
  }

  getTokenizerSize(): number {
    return this.tokenizer.size;
  }
}
