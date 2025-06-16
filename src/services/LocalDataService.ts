/**
 * LocalDataService - API principal para substituir o Supabase
 * Fornece interface unificada para todos os dados locais
 */

import { indexedDBStorage, Song, ManualLabel, ModelData } from './IndexedDBStorage';
import { CSVDataLoader } from './CSVDataLoader';

export interface SystemStats {
  totalSongs: number;
  labeledSongs: number;
  averageScore: number;
  completionRate: number;
  lastUpdate: string;
}

export interface RecentAnalysis {
  id: number;
  artist: string;
  title: string;
  score: number;
  category: string;
  created_at: string;
}

export interface DatasetInfo {
  isLoaded: boolean;
  totalSongs: number;
  yearRange: { min: number; max: number };
  lastLoaded: string | null;
}

class LocalDataService {
  private isInitialized = false;

  /**
   * Inicializar o serviço (substitui conexão com Supabase)
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log('🚀 Inicializando LocalDataService (modo 100% local)...');
      
      // Inicializar IndexedDB
      await indexedDBStorage.init();
      
      // Verificar se dados já estão carregados
      const isDataLoaded = await this.isDatasetLoaded();
      console.log('📊 Dataset carregado?', isDataLoaded);
      
      // Se não há dados, carregar do JSON (mais rápido) ou CSV como fallback
      if (!isDataLoaded) {
        console.log('📊 Dataset não encontrado, tentando carregar do JSON...');
        try {
          await this.loadDatasetFromJSON();
        } catch (error) {
          console.log('⚠️ Falha ao carregar JSON, tentando CSV...', error);
          await this.loadDatasetFromCSV();
        }
      } else {
        console.log('✅ Dataset já carregado localmente');
        const count = await indexedDBStorage.getSongsCount();
        console.log(`📊 Total de músicas: ${count}`);
      }

      this.isInitialized = true;
      console.log('🎉 LocalDataService inicializado com sucesso');
      
    } catch (error) {
      console.error('❌ Erro ao inicializar LocalDataService:', error);
      throw error;
    }
  }

  /**
   * Verificar se dataset já foi carregado
   */
  private async isDatasetLoaded(): Promise<boolean> {
    try {
      const count = await indexedDBStorage.getSongsCount();
      return count > 0;
    } catch {
      return false;
    }
  }

  /**
   * Carregamento inicial do dataset CSV
   */
  private async loadInitialDataset(): Promise<void> {
    try {
      console.log('📂 Carregando músicas do CSV...');
      const songs = await CSVDataLoader.loadSongsFromCSV();
      
      console.log('💾 Salvando no IndexedDB...');
      await indexedDBStorage.insertSongs(songs);
      
      // Salvar informações do carregamento
      await indexedDBStorage.setSetting('dataset_loaded_at', new Date().toISOString());
      await indexedDBStorage.setSetting('dataset_version', '1.0');
      
      console.log(`✅ ${songs.length} músicas carregadas no banco local`);
      
    } catch (error) {
      console.error('❌ Erro ao carregar dataset inicial:', error);
      throw error;
    }
  }

  /**
   * Carregar dataset do CSV (método principal)
   */
  private async loadDatasetFromCSV(): Promise<void> {
    try {
      console.log('📂 Iniciando carregamento do CSV...');
      const songs = await CSVDataLoader.loadSongsFromCSV();
      
      console.log('💾 Salvando músicas no IndexedDB...');
      await indexedDBStorage.insertSongs(songs);
      
      // Marcar como carregado
      await indexedDBStorage.setSetting('dataset_loaded_at', new Date().toISOString());
      await indexedDBStorage.setSetting('dataset_source', 'CSV Local');
      
      console.log(`✅ ${songs.length} músicas carregadas com sucesso!`);
    } catch (error) {
      console.error('❌ Erro ao carregar dataset do CSV:', error);
      throw error;
    }
  }

  /**
   * Carregamento alternativo do dataset a partir do arquivo JSON
   */
  private async loadDatasetFromJSON(): Promise<void> {
    try {
      console.log('📂 Iniciando carregamento do JSON...');
      
      // Carregar o arquivo JSON
      const response = await fetch('/all_songs_data.json');
      if (!response.ok) {
        throw new Error(`Erro ao carregar JSON: ${response.statusText}`);
      }

      const jsonData = await response.json();
      console.log(`📄 JSON carregado: ${jsonData.length} registros`);

      // Converter dados do JSON para nossa estrutura Song
      const songs: Song[] = jsonData.map((item: any, index: number) => ({
        id: index + 1,
        artist: this.cleanString(item.Artist || ''),
        title: this.cleanString(item['Song Title'] || ''),
        lyrics: this.cleanString(item.Lyrics || ''),
        year: item.Year || this.extractYear(item['Release Date'] || ''),
        rank: item.Rank ? parseInt(item.Rank) : null,
        album: this.cleanString(item.Album || ''),
        writers: item.Writers ? this.parseWriters(item.Writers) : [],
        created_at: new Date().toISOString()
      })).filter(song => song.artist && song.title && song.lyrics && song.year);

      console.log('💾 Salvando músicas no IndexedDB...');
      await indexedDBStorage.insertSongs(songs);
      
      // Marcar como carregado
      await indexedDBStorage.setSetting('dataset_loaded_at', new Date().toISOString());
      await indexedDBStorage.setSetting('dataset_source', 'JSON Local');
      
      console.log(`✅ ${songs.length} músicas carregadas com sucesso do JSON!`);
    } catch (error) {
      console.error('❌ Erro ao carregar dataset do JSON:', error);
      throw error;
    }
  }

  /**
   * Limpar e normalizar strings
   */
  private cleanString(str: string): string {
    return str?.toString().trim().replace(/[\r\n\t]+/g, ' ') || '';
  }

  /**
   * Extrair ano de string
   */
  private extractYear(yearStr: string): number {
    if (!yearStr) return new Date().getFullYear();
    
    const match = yearStr.toString().match(/\d{4}/);
    if (match) {
      const year = parseInt(match[0]);
      return year >= 1900 && year <= new Date().getFullYear() ? year : new Date().getFullYear();
    }
    
    return new Date().getFullYear();
  }

  /**
   * Parse writers string to array
   */
  private parseWriters(writers: string | any[]): string[] {
    if (!writers) return [];
    
    // Se é string, pode ser JSON
    if (typeof writers === 'string') {
      try {
        const parsed = JSON.parse(writers);
        if (Array.isArray(parsed)) {
          return parsed.map(w => w.name || w.toString()).filter(w => w);
        }
      } catch {
        // Se não é JSON, tratar como string separada por vírgulas
        return writers.split(',').map(w => w.trim()).filter(w => w.length > 0);
      }
    }
    
    // Se já é array
    if (Array.isArray(writers)) {
      return writers.map(w => w.name || w.toString()).filter(w => w);
    }
    
    return [];
  }

  // === MÉTODOS PARA SONGS (substituem queries do Supabase) ===

  /**
   * Obter todas as músicas com filtros
   */
  async getSongs(options?: {
    limit?: number;
    offset?: number;
    filters?: {
      year?: number;
      artist?: string;
      title?: string;
      yearRange?: { min: number; max: number };
    };
    orderBy?: 'year' | 'artist' | 'title' | 'rank';
    ascending?: boolean;
  }): Promise<{ data: Song[]; count: number }> {
    try {
      // Obter todas as músicas
      let songs = await indexedDBStorage.getSongs();
      
      // Aplicar filtros
      if (options?.filters) {
        const { year, artist, title, yearRange } = options.filters;
        
        if (year) {
          songs = songs.filter(song => song.year === year);
        }
        
        if (yearRange) {
          songs = songs.filter(song => 
            song.year >= yearRange.min && song.year <= yearRange.max
          );
        }
        
        if (artist) {
          songs = songs.filter(song => 
            song.artist.toLowerCase().includes(artist.toLowerCase())
          );
        }
        
        if (title) {
          songs = songs.filter(song => 
            song.title.toLowerCase().includes(title.toLowerCase())
          );
        }
      }

      const totalCount = songs.length;

      // Aplicar ordenação
      if (options?.orderBy) {
        const ascending = options.ascending !== false;
        songs.sort((a, b) => {
          let valueA: any, valueB: any;
          
          switch (options.orderBy) {
            case 'year':
              valueA = a.year;
              valueB = b.year;
              break;
            case 'artist':
              valueA = a.artist.toLowerCase();
              valueB = b.artist.toLowerCase();
              break;
            case 'title':
              valueA = a.title.toLowerCase();
              valueB = b.title.toLowerCase();
              break;
            case 'rank':
              valueA = a.rank || 999;
              valueB = b.rank || 999;
              break;
            default:
              return 0;
          }
          
          if (valueA < valueB) return ascending ? -1 : 1;
          if (valueA > valueB) return ascending ? 1 : -1;
          return 0;
        });
      }

      // Aplicar paginação
      if (options?.offset || options?.limit) {
        const offset = options.offset || 0;
        const limit = options.limit || songs.length;
        songs = songs.slice(offset, offset + limit);
      }

      return { data: songs, count: totalCount };
      
    } catch (error) {
      console.error('Erro ao obter músicas:', error);
      throw error;
    }
  }

  /**
   * Obter música por ID
   */
  async getSongById(id: number): Promise<Song | null> {
    return await indexedDBStorage.getSongById(id);
  }

  /**
   * Obter contagem total de músicas
   */
  async getSongsCount(): Promise<number> {
    return await indexedDBStorage.getSongsCount();
  }

  /**
   * Buscar músicas por critérios
   */
  async searchSongs(criteria: {
    artist?: string;
    title?: string;
    year?: number;
    yearRange?: [number, number];
  }): Promise<Song[]> {
    try {
      const allSongs = await indexedDBStorage.getSongs();
      
      let filtered = allSongs;
      
      if (criteria.artist) {
        filtered = filtered.filter(song => 
          song.artist.toLowerCase().includes(criteria.artist!.toLowerCase())
        );
      }
      
      if (criteria.title) {
        filtered = filtered.filter(song => 
          song.title.toLowerCase().includes(criteria.title!.toLowerCase())
        );
      }
      
      if (criteria.year) {
        filtered = filtered.filter(song => song.year === criteria.year);
      }
      
      if (criteria.yearRange) {
        const [min, max] = criteria.yearRange;
        filtered = filtered.filter(song => song.year >= min && song.year <= max);
      }
      
      return filtered;
    } catch (error) {
      console.error('Erro ao buscar músicas:', error);
      return [];
    }
  }

  // === MÉTODOS PARA MANUAL_LABELS ===

  /**
   * Inserir novo rótulo manual
   */
  async insertLabel(label: {
    song_id: number;
    score: number;
    justification: string;
    theme: string;
    severity_level?: string;
  }): Promise<{ data: ManualLabel; error: null }> {
    try {
      // Adicionar created_at automaticamente
      const labelWithTimestamp = {
        ...label,
        created_at: new Date().toISOString()
      };
      
      const id = await indexedDBStorage.insertLabel(labelWithTimestamp);
      const insertedLabel: ManualLabel = {
        id,
        ...labelWithTimestamp
      };
      
      console.log(`✅ Rótulo inserido: ${label.theme} - Score: ${label.score}`);
      return { data: insertedLabel, error: null };
      
    } catch (error) {
      console.error('Erro ao inserir rótulo:', error);
      return { data: null as any, error: error as any };
    }
  }

  /**
   * Obter rótulos com joins simulados
   */
  async getLabelsWithSongs(theme?: string, limit?: number): Promise<{
    data: Array<{
      id: number;
      score: number;
      justification: string;
      created_at: string;
      songs: {
        id: number;
        artist: string;
        title: string;
        lyrics: string;
        year: number;
      };
    }>;
  }> {
    try {
      // Obter rótulos
      const labels = await indexedDBStorage.getLabels(theme ? { theme } : undefined);
      
      // Simular JOIN com songs
      const labelsWithSongs = [];
      
      for (const label of labels) {
        const song = await indexedDBStorage.getSongById(label.song_id);
        if (song) {
          labelsWithSongs.push({
            id: label.id,
            score: label.score,
            justification: label.justification,
            created_at: label.created_at,
            songs: {
              id: song.id,
              artist: song.artist,
              title: song.title,
              lyrics: song.lyrics,
              year: song.year
            }
          });
        }
      }

      // Aplicar limite
      if (limit) {
        labelsWithSongs.splice(limit);
      }

      // Ordenar por data (mais recente primeiro)
      labelsWithSongs.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      return { data: labelsWithSongs };
      
    } catch (error) {
      console.error('Erro ao obter rótulos com songs:', error);
      throw error;
    }
  }

  /**
   * Obter contagem de rótulos
   */
  async getLabelsCount(theme?: string): Promise<number> {
    return await indexedDBStorage.getLabelsCount(theme);
  }

  /**
   * Obter IDs de músicas já rotuladas
   */
  async getLabeledSongIds(theme: string): Promise<number[]> {
    return await indexedDBStorage.getLabeledSongIds(theme);
  }

  /**
   * Obter músicas não rotuladas
   */
  async getUnlabeledSongs(limit?: number, theme: string = 'Misoginia'): Promise<Song[]> {
    try {
      console.log(`🔍 Buscando músicas não rotuladas (tema: ${theme}, limite: ${limit})`);
      
      const labeledIds = await this.getLabeledSongIds(theme);
      console.log(`🏷️ IDs rotulados encontrados: ${labeledIds.length}`);
      
      const allSongs = await indexedDBStorage.getSongs();
      console.log(`🎵 Total de músicas no banco: ${allSongs.length}`);
      
      // Filtrar músicas não rotuladas
      let unlabeledSongs = allSongs.filter(song => !labeledIds.includes(song.id));
      console.log(`🎵 Músicas não rotuladas: ${unlabeledSongs.length}`);
      
      // Ordenar por ano (mais recente primeiro) para priorizar músicas contemporâneas
      unlabeledSongs.sort((a, b) => b.year - a.year);
      
      // Aplicar limite
      if (limit) {
        unlabeledSongs = unlabeledSongs.slice(0, limit);
        console.log(`🎵 Aplicando limite de ${limit}, resultado: ${unlabeledSongs.length} músicas`);
      }
      
      // Log de algumas músicas para debug
      if (unlabeledSongs.length > 0) {
        console.log('🎵 Primeiras músicas:', unlabeledSongs.slice(0, 3).map(s => `${s.artist} - ${s.title} (${s.year})`));
      }
      
      return unlabeledSongs;
      
    } catch (error) {
      console.error('Erro ao obter músicas não rotuladas:', error);
      throw error;
    }
  }

  // === ESTATÍSTICAS E DASHBOARD ===

  /**
   * Obter estatísticas do sistema (substitui queries complexas do Supabase)
   */
  async getSystemStats(): Promise<SystemStats> {
    try {
      const totalSongs = await this.getSongsCount();
      const labeledSongs = await this.getLabelsCount('Misoginia');
      
      // Calcular média de scores
      const labels = await indexedDBStorage.getLabels({ theme: 'Misoginia' });
      const averageScore = labels.length > 0 
        ? labels.reduce((sum, label) => sum + label.score, 0) / labels.length
        : 0;

      // Taxa de completude
      const completionRate = totalSongs > 0 ? (labeledSongs / totalSongs) * 100 : 0;

      return {
        totalSongs,
        labeledSongs,
        averageScore,
        completionRate,
        lastUpdate: new Date().toLocaleDateString('pt-BR')
      };
      
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      throw error;
    }
  }

  /**
   * Obter análises recentes
   */
  async getRecentAnalyses(limit: number = 5): Promise<RecentAnalysis[]> {
    try {
      const labelsWithSongs = await this.getLabelsWithSongs('Misoginia', limit);
      
      return labelsWithSongs.data.map(item => ({
        id: item.id,
        artist: item.songs.artist,
        title: item.songs.title,
        score: item.score,
        category: this.getScoreCategory(item.score),
        created_at: item.created_at
      }));
      
    } catch (error) {
      console.error('Erro ao obter análises recentes:', error);
      throw error;
    }
  }

  /**
   * Categorizar score
   */
  private getScoreCategory(score: number): string {
    if (score <= 0.33) return 'Baixo';
    if (score <= 0.66) return 'Médio';
    return 'Alto';
  }

  /**
   * Obter informações do dataset
   */
  async getDatasetInfo(): Promise<DatasetInfo> {
    try {
      const totalSongs = await this.getSongsCount();
      const lastLoaded = await indexedDBStorage.getSetting('dataset_loaded_at');
      
      let yearRange = { min: 1959, max: new Date().getFullYear() };
      
      if (totalSongs > 0) {
        const songs = await indexedDBStorage.getSongs();
        const years = songs.map(s => s.year);
        yearRange = {
          min: Math.min(...years),
          max: Math.max(...years)
        };
      }

      return {
        isLoaded: totalSongs > 0,
        totalSongs,
        yearRange,
        lastLoaded
      };
      
    } catch (error) {
      console.error('Erro ao obter informações do dataset:', error);
      throw error;
    }
  }

  // === MODELOS ===

  /**
   * Salvar modelo treinado
   */
  async saveModel(modelId: string, modelData: ArrayBuffer, config: any): Promise<void> {
    await indexedDBStorage.saveModel({
      id: modelId,
      model_name: 'misogyny_detector_cnn',
      model_data: modelData,
      training_config: config,
      version: '2.0'
    });
  }

  /**
   * Carregar modelo salvo
   */
  async loadModel(modelId: string): Promise<ModelData | null> {
    return await indexedDBStorage.getModel(modelId);
  }

  /**
   * Obter dados formatados para treinamento do modelo
   */
  async getTrainingData(): Promise<Array<{
    id: number;
    lyrics: string;
    artist: string;
    title: string;
    score: number;
    justification: string | null;
  }>> {
    try {
      const labels = await indexedDBStorage.getLabels({ theme: 'Misoginia' });
      const allSongs = await indexedDBStorage.getSongs();
      
      // Criar mapa de músicas para busca eficiente
      const songsMap = new Map(allSongs.map(song => [song.id, song]));
      
      const trainingData = labels
        .map(label => {
          const song = songsMap.get(label.song_id);
          if (!song || !song.lyrics) return null;
          
          return {
            id: song.id,
            lyrics: song.lyrics,
            artist: song.artist,
            title: song.title,
            score: label.score,
            justification: label.justification
          };
        })
        .filter(item => item !== null) as Array<{
          id: number;
          lyrics: string;
          artist: string;
          title: string;
          score: number;
          justification: string | null;
        }>;
      
      console.log(`📊 ${trainingData.length} amostras de treinamento preparadas`);
      return trainingData;
    } catch (error) {
      console.error('Erro ao obter dados de treinamento:', error);
      return [];
    }
  }

  // === UTILITÁRIOS ===

  /**
   * Limpar todos os dados (desenvolvimento)
   */
  async clearAllData(): Promise<void> {
    await indexedDBStorage.clearAll();
    this.isInitialized = false;
    console.log('🧹 Todos os dados locais foram limpos');
  }

  /**
   * Recarregar dataset do CSV
   */
  async reloadDataset(): Promise<void> {
    await this.clearAllData();
    await this.initialize();
  }

  /**
   * Verificar status de inicialização
   */
  isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Inserir múltiplas músicas de uma vez
   */
  async bulkInsertSongs(songs: Omit<Song, 'id' | 'created_at'>[]): Promise<void> {
    try {
      console.log(`💾 Inserindo ${songs.length} músicas em lote...`);
      
      // Converter para o formato do IndexedDB (que auto-gera o ID)
      const songsForDB = songs.map(song => ({
        ...song,
        id: 0, // Será auto-gerado pelo IndexedDB
        created_at: new Date().toISOString()
      }));
      
      await indexedDBStorage.insertSongs(songsForDB);
      
      console.log(`✅ ${songs.length} músicas inseridas com sucesso`);
    } catch (error) {
      console.error('Erro ao inserir músicas em lote:', error);
      throw error;
    }
  }

  /**
   * Forçar recarregamento completo dos dados (para debugging)
   */
  async forceReloadData(): Promise<void> {
    try {
      console.log('🔄 Forçando recarregamento completo dos dados...');
      
      // Limpar dados existentes
      await indexedDBStorage.clearAll();
      
      // Recarregar dados
      await this.loadDatasetFromJSON();
      
      console.log('✅ Dados recarregados com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao forçar recarregamento:', error);
      throw error;
    }
  }
}

// Singleton para uso global
export const localDataService = new LocalDataService();
