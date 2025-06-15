
import * as tf from '@tensorflow/tfjs';

export class ModelArchitecture {
  static createModel(vocabSize: number, maxSequenceLength: number): tf.LayersModel {
    console.log('Criando modelo CNN ultra-compacto...');

    // Arquitetura minimalista para evitar problemas de memória
    const model = tf.sequential({
      layers: [
        // Embedding muito pequeno
        tf.layers.embedding({
          inputDim: vocabSize,
          outputDim: 32, // Drasticamente reduzido de 128
          inputLength: maxSequenceLength,
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
    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'binaryCrossentropy',
      metrics: ['accuracy']
    });

    console.log('Modelo CNN ultra-compacto criado!');
    console.log(`Parâmetros totais: ${model.countParams()}`);
    model.summary();

    return model;
  }
}
