import * as tf from '@tensorflow/tfjs';

export class ModelArchitecture {
  // Constantes para o modelo aprimorado
  static readonly VOCAB_SIZE = 5000; // Expandido de 1000
  static readonly MAX_SEQUENCE_LENGTH = 100; // Expandido de 50
  static readonly EMBEDDING_DIM = 64; // Expandido de 32

  static createModel(vocabSize: number = this.VOCAB_SIZE, maxSequenceLength: number = this.MAX_SEQUENCE_LENGTH): tf.LayersModel {
    console.log('🧠 Criando modelo CNN aprimorado...');
    console.log(`📊 Configuração: vocab=${vocabSize}, seq=${maxSequenceLength}, emb=${this.EMBEDDING_DIM}`);

    // Arquitetura CNN robusta para melhor performance
    const model = tf.sequential({
      layers: [
        // Embedding mais expressivo
        tf.layers.embedding({
          inputDim: vocabSize,
          outputDim: this.EMBEDDING_DIM, // 64 dimensões para melhor representação
          inputLength: maxSequenceLength,
          name: 'embedding',
          embeddingsRegularizer: tf.regularizers.l2({ l2: 0.0001 })
        }),

        // Primeira camada convolucional - Filtros pequenos para capturar padrões locais
        tf.layers.conv1d({
          filters: 64, // Aumentado significativamente
          kernelSize: 3,
          activation: 'relu',
          padding: 'same',
          name: 'conv1d_1',
          kernelRegularizer: tf.regularizers.l2({ l2: 0.0001 })
        }),
        tf.layers.batchNormalization({ name: 'batch_norm_1' }),
        tf.layers.maxPooling1d({ poolSize: 2, name: 'maxpool_1' }),
        tf.layers.dropout({ rate: 0.2, name: 'dropout_1' }),

        // Segunda camada convolucional - Filtros médios
        tf.layers.conv1d({
          filters: 128, // Mais filtros para padrões complexos
          kernelSize: 4,
          activation: 'relu',
          padding: 'same',
          name: 'conv1d_2',
          kernelRegularizer: tf.regularizers.l2({ l2: 0.0001 })
        }),
        tf.layers.batchNormalization({ name: 'batch_norm_2' }),
        tf.layers.maxPooling1d({ poolSize: 2, name: 'maxpool_2' }),
        tf.layers.dropout({ rate: 0.3, name: 'dropout_2' }),

        // Terceira camada convolucional - Filtros maiores para contexto
        tf.layers.conv1d({
          filters: 64, // Reduzir gradualmente
          kernelSize: 5,
          activation: 'relu',
          padding: 'same',
          name: 'conv1d_3',
          kernelRegularizer: tf.regularizers.l2({ l2: 0.0001 })
        }),
        tf.layers.batchNormalization({ name: 'batch_norm_3' }),
        tf.layers.maxPooling1d({ poolSize: 2, name: 'maxpool_3' }),

        // Quarta camada convolucional - Padrões de alto nível
        tf.layers.conv1d({
          filters: 32,
          kernelSize: 3,
          activation: 'relu',
          padding: 'same',
          name: 'conv1d_4',
          kernelRegularizer: tf.regularizers.l2({ l2: 0.0001 })
        }),
        tf.layers.batchNormalization({ name: 'batch_norm_4' }),
        
        // Global pooling para capturar features mais importantes
        tf.layers.globalMaxPooling1d({ name: 'global_max_pooling' }),

        // Camadas densas com regularização avançada
        tf.layers.dense({
          units: 128, // Primeira camada densa robusta
          activation: 'relu',
          name: 'dense_1',
          kernelRegularizer: tf.regularizers.l2({ l2: 0.001 })
        }),
        tf.layers.batchNormalization({ name: 'batch_norm_dense_1' }),
        tf.layers.dropout({ rate: 0.4, name: 'dropout_dense_1' }),

        tf.layers.dense({
          units: 64, // Segunda camada densa
          activation: 'relu',
          name: 'dense_2',
          kernelRegularizer: tf.regularizers.l2({ l2: 0.001 })
        }),
        tf.layers.batchNormalization({ name: 'batch_norm_dense_2' }),
        tf.layers.dropout({ rate: 0.3, name: 'dropout_dense_2' }),

        tf.layers.dense({
          units: 32, // Terceira camada densa
          activation: 'relu',
          name: 'dense_3',
          kernelRegularizer: tf.regularizers.l2({ l2: 0.001 })
        }),
        tf.layers.dropout({ rate: 0.2, name: 'dropout_dense_3' }),
        
        // Camada de saída
        tf.layers.dense({
          units: 1,
          activation: 'sigmoid',
          name: 'output'
        })
      ]
    });

    // Configuração de treinamento otimizada
    // Compilação do modelo com otimizador Adam e métricas
    model.compile({
      optimizer: tf.train.adam(0.0005), // Taxa de aprendizado ajustada
      loss: 'meanSquaredError', // Ideal para regressão de score
      metrics: ['accuracy', 'mae'] // Usa o alias 'mae' para Mean Absolute Error
    });

    console.log('✅ Modelo compilado com sucesso!');

    const paramCount = model.countParams();
    console.log('🎯 Modelo CNN aprimorado criado!');
    console.log(`📈 Parâmetros totais: ${paramCount.toLocaleString()}`);
    console.log(`🎭 Arquitetura: 4 camadas Conv1D + 3 camadas densas`);
    console.log(`🔧 Regularização: L2 + BatchNorm + Dropout`);
    
    // Verificar se atingiu o target de ~50K parâmetros
    if (paramCount >= 40000 && paramCount <= 60000) {
      console.log('✅ Target de parâmetros atingido (40K-60K)');
    } else if (paramCount < 40000) {
      console.log('⚠️ Modelo menor que o esperado');
    } else {
      console.log('⚠️ Modelo maior que o esperado - pode impactar performance');
    }

    // Mostrar summary detalhado
    model.summary();

    return model;
  }

  /**
   * Criar arquitetura alternativa com diferentes configurações
   */
  static createCompactModel(vocabSize: number, maxSequenceLength: number): tf.LayersModel {
    console.log('🔧 Criando modelo CNN compacto (fallback)...');

    const model = tf.sequential({
      layers: [
        tf.layers.embedding({
          inputDim: vocabSize,
          outputDim: 32,
          inputLength: maxSequenceLength,
          name: 'embedding_compact'
        }),

        tf.layers.conv1d({
          filters: 32,
          kernelSize: 3,
          activation: 'relu',
          name: 'conv1d_compact'
        }),
        tf.layers.maxPooling1d({ poolSize: 2 }),
        tf.layers.globalMaxPooling1d(),

        tf.layers.dense({
          units: 16,
          activation: 'relu',
          name: 'dense_compact'
        }),
        tf.layers.dropout({ rate: 0.3 }),
        
        tf.layers.dense({
          units: 1,
          activation: 'sigmoid',
          name: 'output_compact'
        })
      ]
    });

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'binaryCrossentropy',
      metrics: ['accuracy']
    });

    console.log(`📦 Modelo compacto: ${model.countParams()} parâmetros`);
    return model;
  }

  /**
   * Obter configurações do modelo
   */
  static getModelConfig() {
    return {
      vocabSize: this.VOCAB_SIZE,
      maxSequenceLength: this.MAX_SEQUENCE_LENGTH,
      embeddingDim: this.EMBEDDING_DIM,
      architecture: 'CNN Multi-Layer',
      targetParams: '40K-60K',
      regularization: ['L2', 'BatchNormalization', 'Dropout'],
      layers: {
        conv1d: 4,
        dense: 3,
        pooling: 4,
        dropout: 6,
        batchNorm: 5
      }
    };
  }
}
