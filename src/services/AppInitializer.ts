/**
 * AppInitializer - Inicialização completa do sistema local
 * Coordena o carregamento de dados e serviços offline
 */

import { localDataService } from './LocalDataService';
import { CSVDataLoader } from './CSVDataLoader';
import { indexedDBStorage } from './IndexedDBStorage';

export interface InitializationProgress {
  stage: string;
  progress: number;
  message: string;
  isComplete: boolean;
  error?: string;
}

export interface InitializationResult {
  success: boolean;
  totalSongs: number;
  totalLabels: number;
  initializationTime: number;
  stages: InitializationProgress[];
  error?: string;
}

export type InitializationCallback = (progress: InitializationProgress) => void;

class AppInitializer {
  private isInitialized = false;
  private isInitializing = false;
  private initializationResult: InitializationResult | null = null;

  /**
   * Inicializar sistema completo
   */
  async initialize(onProgress?: InitializationCallback): Promise<InitializationResult> {
    if (this.isInitialized) {
      return this.initializationResult!;
    }

    if (this.isInitializing) {
      throw new Error('Inicialização já em andamento');
    }

    this.isInitializing = true;
    const startTime = Date.now();
    const stages: InitializationProgress[] = [];

    try {
      console.log('🚀 Iniciando sistema local...');

      // Estágio 1: Verificar IndexedDB
      const stage1 = await this.runStage(
        'indexeddb',
        'Inicializando banco de dados local...',
        async () => {
          await indexedDBStorage.init();
          return 'IndexedDB inicializado';
        },
        onProgress
      );
      stages.push(stage1);

      // Estágio 2: Verificar dados existentes
      const stage2 = await this.runStage(
        'check-data',
        'Verificando dados existentes...',
        async () => {
          const songsCount = await indexedDBStorage.getSongsCount();
          const labelsCount = await indexedDBStorage.getLabelsCount();
          
          return `Encontrados: ${songsCount} músicas, ${labelsCount} rótulos`;
        },
        onProgress
      );
      stages.push(stage2);

      // Estágio 3: Carregar dataset se necessário
      const needsDataLoad = await this.needsDataLoad();
      if (needsDataLoad) {
        const stage3 = await this.runStage(
          'load-dataset',
          'Carregando dataset CSV...',
          async () => {
            const songs = await CSVDataLoader.loadSongsFromCSV();
            await indexedDBStorage.insertSongs(songs);
            await indexedDBStorage.setSetting('dataset_loaded_at', new Date().toISOString());
            return `${songs.length} músicas carregadas`;
          },
          onProgress
        );
        stages.push(stage3);
      } else {
        stages.push({
          stage: 'load-dataset',
          progress: 100,
          message: 'Dataset já carregado',
          isComplete: true
        });
      }

      // Estágio 4: Inicializar LocalDataService
      const stage4 = await this.runStage(
        'local-service',
        'Inicializando serviços locais...',
        async () => {
          await localDataService.initialize();
          return 'Serviços locais prontos';
        },
        onProgress
      );
      stages.push(stage4);

      // Estágio 5: Verificação final
      const stage5 = await this.runStage(
        'verification',
        'Verificando integridade...',
        async () => {
          const stats = await localDataService.getSystemStats();
          return `Sistema pronto: ${stats.totalSongs} músicas, ${stats.labeledSongs} rotuladas`;
        },
        onProgress
      );
      stages.push(stage5);

      // Finalizar inicialização
      const endTime = Date.now();
      const initializationTime = endTime - startTime;

      const finalStats = await localDataService.getSystemStats();
      
      this.initializationResult = {
        success: true,
        totalSongs: finalStats.totalSongs,
        totalLabels: finalStats.labeledSongs,
        initializationTime,
        stages
      };

      this.isInitialized = true;
      this.isInitializing = false;

      console.log('🎉 Sistema inicializado com sucesso!');
      console.log(`⏱️ Tempo total: ${initializationTime}ms`);
      console.log(`📊 Dados: ${finalStats.totalSongs} músicas, ${finalStats.labeledSongs} rótulos`);

      return this.initializationResult;

    } catch (error) {
      console.error('❌ Erro na inicialização:', error);
      
      const endTime = Date.now();
      const initializationTime = endTime - startTime;

      this.initializationResult = {
        success: false,
        totalSongs: 0,
        totalLabels: 0,
        initializationTime,
        stages,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };

      this.isInitializing = false;
      
      // Tentar notificar sobre o erro
      if (onProgress) {
        onProgress({
          stage: 'error',
          progress: 0,
          message: `Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
          isComplete: true,
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        });
      }

      throw error;
    }
  }

  /**
   * Executar estágio de inicialização
   */
  private async runStage(
    stage: string,
    message: string,
    action: () => Promise<string>,
    onProgress?: InitializationCallback
  ): Promise<InitializationProgress> {
    const progress: InitializationProgress = {
      stage,
      progress: 0,
      message,
      isComplete: false
    };

    try {
      // Notificar início
      if (onProgress) {
        onProgress({ ...progress, progress: 0 });
      }

      // Executar ação
      const result = await action();
      
      // Notificar conclusão
      const completedProgress: InitializationProgress = {
        stage,
        progress: 100,
        message: result,
        isComplete: true
      };

      if (onProgress) {
        onProgress(completedProgress);
      }

      return completedProgress;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      const errorProgress: InitializationProgress = {
        stage,
        progress: 0,
        message: `Erro: ${errorMessage}`,
        isComplete: true,
        error: errorMessage
      };

      if (onProgress) {
        onProgress(errorProgress);
      }

      throw error;
    }
  }

  /**
   * Verificar se precisa carregar dados
   */
  private async needsDataLoad(): Promise<boolean> {
    try {
      const songsCount = await indexedDBStorage.getSongsCount();
      return songsCount === 0;
    } catch {
      return true;
    }
  }

  /**
   * Reinicializar sistema (para desenvolvimento)
   */
  async reinitialize(onProgress?: InitializationCallback): Promise<InitializationResult> {
    console.log('🔄 Reinicializando sistema...');
    
    try {
      // Limpar dados existentes
      await indexedDBStorage.clearAll();
      
      this.isInitialized = false;
      this.isInitializing = false;
      this.initializationResult = null;

      // Inicializar novamente
      return await this.initialize(onProgress);
      
    } catch (error) {
      console.error('❌ Erro ao reinicializar:', error);
      throw error;
    }
  }

  /**
   * Verificar status de inicialização
   */
  isReady(): boolean {
    return this.isInitialized && this.initializationResult?.success === true;
  }

  /**
   * Obter resultado da inicialização
   */
  getInitializationResult(): InitializationResult | null {
    return this.initializationResult;
  }

  /**
   * Verificar se está em processo de inicialização
   */
  isInitializingNow(): boolean {
    return this.isInitializing;
  }

  /**
   * Obter estatísticas do sistema
   */
  async getSystemInfo(): Promise<{
    isReady: boolean;
    totalSongs: number;
    totalLabels: number;
    datasetInfo: any;
    lastInitialization: string | null;
  }> {
    try {
      if (!this.isReady()) {
        return {
          isReady: false,
          totalSongs: 0,
          totalLabels: 0,
          datasetInfo: null,
          lastInitialization: null
        };
      }

      const stats = await localDataService.getSystemStats();
      const datasetInfo = await localDataService.getDatasetInfo();
      
      return {
        isReady: true,
        totalSongs: stats.totalSongs,
        totalLabels: stats.labeledSongs,
        datasetInfo,
        lastInitialization: this.initializationResult?.stages[0]?.message || null
      };

    } catch (error) {
      console.error('Erro ao obter informações do sistema:', error);
      return {
        isReady: false,
        totalSongs: 0,
        totalLabels: 0,
        datasetInfo: null,
        lastInitialization: null
      };
    }
  }

  /**
   * Forçar carregamento de dados frescos
   */
  async reloadData(onProgress?: InitializationCallback): Promise<void> {
    console.log('🔄 Recarregando dados...');
    
    try {
      await this.runStage(
        'reload-data',
        'Limpando dados existentes...',
        async () => {
          await indexedDBStorage.clearAll();
          return 'Dados limpos';
        },
        onProgress
      );

      await this.runStage(
        'reload-data',
        'Carregando dados frescos...',
        async () => {
          const songs = await CSVDataLoader.loadSongsFromCSV();
          await indexedDBStorage.insertSongs(songs);
          await indexedDBStorage.setSetting('dataset_loaded_at', new Date().toISOString());
          return `${songs.length} músicas recarregadas`;
        },
        onProgress
      );

      console.log('✅ Dados recarregados com sucesso');
      
    } catch (error) {
      console.error('❌ Erro ao recarregar dados:', error);
      throw error;
    }
  }

  /**
   * Obter estatísticas de performance
   */
  getPerformanceStats(): {
    initializationTime: number;
    isReady: boolean;
    stagesCount: number;
    errors: string[];
  } {
    const result = this.initializationResult;
    
    return {
      initializationTime: result?.initializationTime || 0,
      isReady: this.isReady(),
      stagesCount: result?.stages.length || 0,
      errors: result?.stages.filter(s => s.error).map(s => s.error!) || []
    };
  }
}

// Singleton para uso global
export const appInitializer = new AppInitializer();
