/**
 * IndexedDBStorage - Sistema de persistência local usando IndexedDB
 * Substitui completamente o Supabase, mantendo funcionalidade offline
 */

export interface Song {
  id: number;
  year: number;
  rank: number | null;
  artist: string;
  title: string;
  lyrics: string;
  album?: string;
  writers?: string[];
  created_at?: string;
}

export interface ManualLabel {
  id: number;
  song_id: number;
  score: number;
  justification: string;
  theme: string;
  created_at: string;
  severity_level?: string;
}

export interface ModelData {
  id: string;
  model_name: string;
  model_data: ArrayBuffer;
  training_config: any;
  created_at: string;
  version: string;
}

class IndexedDBStorage {
  private dbName = 'MusicoAnalysisDB';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        reject(new Error('Erro ao abrir IndexedDB'));
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('✅ IndexedDB inicializado com sucesso');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Tabela de músicas
        if (!db.objectStoreNames.contains('songs')) {
          const songsStore = db.createObjectStore('songs', { keyPath: 'id' });
          songsStore.createIndex('year', 'year');
          songsStore.createIndex('artist', 'artist');
          songsStore.createIndex('title', 'title');
          console.log('📊 Tabela "songs" criada');
        }

        // Tabela de rótulos manuais
        if (!db.objectStoreNames.contains('manual_labels')) {
          const labelsStore = db.createObjectStore('manual_labels', { keyPath: 'id', autoIncrement: true });
          labelsStore.createIndex('song_id', 'song_id');
          labelsStore.createIndex('theme', 'theme');
          labelsStore.createIndex('score', 'score');
          labelsStore.createIndex('created_at', 'created_at');
          console.log('🏷️ Tabela "manual_labels" criada');
        }

        // Tabela de modelos treinados
        if (!db.objectStoreNames.contains('models')) {
          const modelsStore = db.createObjectStore('models', { keyPath: 'id' });
          modelsStore.createIndex('model_name', 'model_name');
          modelsStore.createIndex('created_at', 'created_at');
          console.log('🧠 Tabela "models" criada');
        }

        // Tabela de configurações
        if (!db.objectStoreNames.contains('settings')) {
          const settingsStore = db.createObjectStore('settings', { keyPath: 'key' });
          console.log('⚙️ Tabela "settings" criada');
        }
      };
    });
  }

  // === OPERAÇÕES COM SONGS ===
  async insertSongs(songs: Song[]): Promise<void> {
    if (!this.db) throw new Error('Database não inicializado');

    const transaction = this.db.transaction(['songs'], 'readwrite');
    const store = transaction.objectStore('songs');

    for (const song of songs) {
      await new Promise<void>((resolve, reject) => {
        const request = store.add(song);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }

    console.log(`✅ ${songs.length} músicas inseridas no IndexedDB`);
  }

  async getSongs(filters?: { year?: number, artist?: string, limit?: number }): Promise<Song[]> {
    if (!this.db) throw new Error('Database não inicializado');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['songs'], 'readonly');
      const store = transaction.objectStore('songs');
      const request = store.getAll();

      request.onsuccess = () => {
        let songs = request.result as Song[];

        // Aplicar filtros
        if (filters?.year) {
          songs = songs.filter(song => song.year === filters.year);
        }
        if (filters?.artist) {
          songs = songs.filter(song => 
            song.artist.toLowerCase().includes(filters.artist!.toLowerCase())
          );
        }
        if (filters?.limit) {
          songs = songs.slice(0, filters.limit);
        }

        resolve(songs);
      };

      request.onerror = () => reject(request.error);
    });
  }

  async getSongById(id: number): Promise<Song | null> {
    if (!this.db) throw new Error('Database não inicializado');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['songs'], 'readonly');
      const store = transaction.objectStore('songs');
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => reject(request.error);
    });
  }

  async getSongsCount(): Promise<number> {
    if (!this.db) throw new Error('Database não inicializado');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['songs'], 'readonly');
      const store = transaction.objectStore('songs');
      const request = store.count();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // === OPERAÇÕES COM MANUAL_LABELS ===
  async insertLabel(label: Omit<ManualLabel, 'id'>): Promise<number> {
    if (!this.db) throw new Error('Database não inicializado');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['manual_labels'], 'readwrite');
      const store = transaction.objectStore('manual_labels');
      
      const labelWithDate = {
        ...label,
        created_at: new Date().toISOString()
      };

      const request = store.add(labelWithDate);

      request.onsuccess = () => {
        resolve(request.result as number);
      };

      request.onerror = () => reject(request.error);
    });
  }

  async getLabels(filters?: { theme?: string, song_id?: number }): Promise<ManualLabel[]> {
    if (!this.db) throw new Error('Database não inicializado');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['manual_labels'], 'readonly');
      const store = transaction.objectStore('manual_labels');
      const request = store.getAll();

      request.onsuccess = () => {
        let labels = request.result as ManualLabel[];

        // Aplicar filtros
        if (filters?.theme) {
          labels = labels.filter(label => label.theme === filters.theme);
        }
        if (filters?.song_id) {
          labels = labels.filter(label => label.song_id === filters.song_id);
        }

        resolve(labels);
      };

      request.onerror = () => reject(request.error);
    });
  }

  async getLabelsCount(theme?: string): Promise<number> {
    if (!this.db) throw new Error('Database não inicializado');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['manual_labels'], 'readonly');
      const store = transaction.objectStore('manual_labels');
      const request = store.getAll();

      request.onsuccess = () => {
        let labels = request.result as ManualLabel[];
        
        if (theme) {
          labels = labels.filter(label => label.theme === theme);
        }

        resolve(labels.length);
      };

      request.onerror = () => reject(request.error);
    });
  }

  async getLabeledSongIds(theme: string): Promise<number[]> {
    if (!this.db) throw new Error('Database não inicializado');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['manual_labels'], 'readonly');
      const store = transaction.objectStore('manual_labels');
      const request = store.getAll();

      request.onsuccess = () => {
        const labels = request.result as ManualLabel[];
        const songIds = labels
          .filter(label => label.theme === theme)
          .map(label => label.song_id);
        
        resolve(songIds);
      };

      request.onerror = () => reject(request.error);
    });
  }

  // === OPERAÇÕES COM MODELS ===
  async saveModel(modelData: Omit<ModelData, 'created_at'>): Promise<void> {
    if (!this.db) throw new Error('Database não inicializado');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['models'], 'readwrite');
      const store = transaction.objectStore('models');
      
      const modelWithDate = {
        ...modelData,
        created_at: new Date().toISOString()
      };

      const request = store.put(modelWithDate);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getModel(id: string): Promise<ModelData | null> {
    if (!this.db) throw new Error('Database não inicializado');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['models'], 'readonly');
      const store = transaction.objectStore('models');
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => reject(request.error);
    });
  }

  // === OPERAÇÕES COM SETTINGS ===
  async setSetting(key: string, value: any): Promise<void> {
    if (!this.db) throw new Error('Database não inicializado');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['settings'], 'readwrite');
      const store = transaction.objectStore('settings');
      
      const request = store.put({ key, value });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getSetting(key: string): Promise<any> {
    if (!this.db) throw new Error('Database não inicializado');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['settings'], 'readonly');
      const store = transaction.objectStore('settings');
      const request = store.get(key);

      request.onsuccess = () => {
        resolve(request.result?.value || null);
      };

      request.onerror = () => reject(request.error);
    });
  }

  // === OPERAÇÕES DE LIMPEZA ===
  async clearAll(): Promise<void> {
    if (!this.db) throw new Error('Database não inicializado');

    const storeNames = ['songs', 'manual_labels', 'models', 'settings'];
    const transaction = this.db.transaction(storeNames, 'readwrite');

    for (const storeName of storeNames) {
      const store = transaction.objectStore(storeName);
      await new Promise<void>((resolve, reject) => {
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }

    console.log('🧹 Todos os dados foram limpos do IndexedDB');
  }

  async close(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
      console.log('📦 IndexedDB fechado');
    }
  }
}

// Singleton para uso global
export const indexedDBStorage = new IndexedDBStorage();
