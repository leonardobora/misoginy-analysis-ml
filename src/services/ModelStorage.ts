
import * as tf from '@tensorflow/tfjs';

export class ModelStorage {
  static async saveModel(model: tf.LayersModel, path: string = 'localstorage://misogyny-cnn-ultra-compact'): Promise<void> {
    try {
      // Verificar tamanho do modelo antes de salvar
      const modelSize = model.countParams();
      console.log(`Tentando salvar modelo com ${modelSize} parâmetros`);
      
      await model.save(path);
      console.log(`Modelo ultra-compacto salvo com sucesso em: ${path}`);
    } catch (error) {
      console.error('Erro ao salvar modelo:', error);
      
      // Tentar salvar com nome diferente em caso de erro
      const fallbackPath = 'localstorage://misogyny-cnn-mini';
      try {
        await model.save(fallbackPath);
        console.log(`Modelo salvo em caminho alternativo: ${fallbackPath}`);
      } catch (fallbackError) {
        console.error('Falha também no caminho alternativo:', fallbackError);
        throw new Error('Não foi possível salvar o modelo. Modelo muito grande para localStorage.');
      }
    }
  }

  static async loadModel(path: string = 'localstorage://misogyny-cnn-ultra-compact'): Promise<tf.LayersModel | null> {
    try {
      const model = await tf.loadLayersModel(path);
      console.log(`Modelo carregado de: ${path}`);
      return model;
    } catch (error) {
      console.log('Modelo não encontrado, tentando caminho alternativo...');
      try {
        const model = await tf.loadLayersModel('localstorage://misogyny-cnn-mini');
        console.log('Modelo carregado do caminho alternativo');
        return model;
      } catch (fallbackError) {
        console.log('Nenhum modelo encontrado');
        return null;
      }
    }
  }
}
