/**
 * CSVDataLoader - Carregamento e parsing do dataset CSV local
 * Substitui a necessidade de dados externos (Supabase)
 */

import { Song } from './IndexedDBStorage';

export class CSVDataLoader {
  private static readonly CSV_PATH = '/songs_lyrics_dataset.csv';

  /**
   * Carrega e faz parse do CSV local
   */
  static async loadSongsFromCSV(): Promise<Song[]> {
    try {
      console.log('📊 Carregando dataset CSV local...');
      
      // Carregar o arquivo CSV
      const response = await fetch(this.CSV_PATH);
      if (!response.ok) {
        throw new Error(`Erro ao carregar CSV: ${response.statusText}`);
      }

      const csvText = await response.text();
      console.log(`📄 CSV carregado: ${csvText.length} caracteres`);

      // Fazer parse do CSV
      const songs = this.parseCSV(csvText);
      console.log(`✅ ${songs.length} músicas processadas do CSV`);

      return songs;
    } catch (error) {
      console.error('❌ Erro ao carregar CSV:', error);
      throw error;
    }
  }

  /**
   * Parse robusto do CSV, lidando com vírgulas em aspas
   */
  private static parseCSV(csvText: string): Song[] {
    const lines = csvText.split('\n');
    if (lines.length === 0) {
      throw new Error('CSV vazio');
    }

    // Extrair headers
    const headers = this.parseCSVLine(lines[0]);
    console.log('📋 Headers encontrados:', headers);

    // Mapeamento dos campos do CSV para nossa estrutura
    const fieldMapping = {
      artist: 'Artist',
      title: 'Song Title',
      lyrics: 'Lyrics',
      year: 'Year',
      rank: 'Rank',
      album: 'Album',
      writers: 'Writers'
    };

    const songs: Song[] = [];
    let successCount = 0;
    let errorCount = 0;

    // Processar cada linha
    for (let i = 1; i < lines.length; i++) {
      try {
        const line = lines[i].trim();
        if (!line) continue;

        const values = this.parseCSVLine(line);
        if (values.length < headers.length) continue;

        // Criar objeto song
        const songData: any = {};
        headers.forEach((header, index) => {
          if (index < values.length) {
            songData[header] = values[index];
          }
        });

        // Mapear para nossa estrutura
        const song: Song = {
          id: i, // ID sequencial
          artist: this.cleanString(songData[fieldMapping.artist] || ''),
          title: this.cleanString(songData[fieldMapping.title] || ''),
          lyrics: this.cleanString(songData[fieldMapping.lyrics] || ''),
          year: this.parseYear(songData[fieldMapping.year]),
          rank: this.parseRank(songData[fieldMapping.rank]),
          album: this.cleanString(songData[fieldMapping.album] || ''),
          writers: this.parseWriters(songData[fieldMapping.writers] || ''),
          created_at: new Date().toISOString()
        };

        // Validações básicas
        if (this.isValidSong(song)) {
          songs.push(song);
          successCount++;
        } else {
          errorCount++;
        }

      } catch (error) {
        errorCount++;
        if (errorCount < 10) { // Log apenas os primeiros erros
          console.warn(`⚠️ Erro na linha ${i}:`, error);
        }
      }
    }

    console.log(`📊 Processamento concluído: ${successCount} sucessos, ${errorCount} erros`);
    
    if (songs.length === 0) {
      throw new Error('Nenhuma música válida encontrada no CSV');
    }

    // Ordenar por ano (mais recente primeiro)
    songs.sort((a, b) => b.year - a.year);

    return songs;
  }

  /**
   * Parse de linha CSV respeitando aspas
   */
  private static parseCSVLine(line: string): string[] {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    let quoteChar = '';

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if ((char === '"' || char === "'") && !inQuotes) {
        // Início de string com aspas
        inQuotes = true;
        quoteChar = char;
      } else if (char === quoteChar && inQuotes) {
        // Fim de string com aspas (ou escape)
        if (nextChar === quoteChar) {
          // Escape de aspas ("")
          current += char;
          i++; // Pular próximo char
        } else {
          inQuotes = false;
          quoteChar = '';
        }
      } else if (char === ',' && !inQuotes) {
        // Separador de campo
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    // Adicionar último campo
    values.push(current.trim());

    return values;
  }

  /**
   * Limpa e sanitiza strings
   */
  private static cleanString(str: string): string {
    return str
      .replace(/^["']|["']$/g, '') // Remove aspas do início/fim
      .replace(/""/g, '"') // Unescape aspas duplas
      .replace(/''/g, "'") // Unescape aspas simples
      .trim();
  }

  /**
   * Parse do ano
   */
  private static parseYear(yearStr: string): number {
    const year = parseFloat(yearStr);
    if (isNaN(year) || year < 1900 || year > new Date().getFullYear()) {
      return new Date().getFullYear(); // Default para ano atual
    }
    return Math.floor(year);
  }

  /**
   * Parse do ranking
   */
  private static parseRank(rankStr: string): number | null {
    if (!rankStr || rankStr.trim() === '') return null;
    const rank = parseInt(rankStr);
    return isNaN(rank) ? null : rank;
  }

  /**
   * Parse dos writers (JSON array)
   */
  private static parseWriters(writersStr: string): string[] {
    try {
      if (!writersStr || writersStr.trim() === '') return [];
      
      // Tentar parse como JSON
      const parsed = JSON.parse(writersStr);
      if (Array.isArray(parsed)) {
        return parsed.map(w => typeof w === 'object' ? w.name || String(w) : String(w));
      }
      
      return [String(parsed)];
    } catch {
      // Se falhar, tratar como string simples
      return writersStr ? [writersStr] : [];
    }
  }

  /**
   * Validação básica de música
   */
  private static isValidSong(song: Song): boolean {
    return (
      song.artist && song.artist.length > 0 &&
      song.title && song.title.length > 0 &&
      song.lyrics && song.lyrics.length > 10 && // Mínimo de 10 caracteres
      song.year >= 1950 && song.year <= new Date().getFullYear()
    );
  }

  /**
   * Estatísticas do dataset
   */
  static async getDatasetStats(): Promise<{
    totalSongs: number;
    yearRange: { min: number; max: number };
    topArtists: { artist: string; count: number }[];
    avgLyricsLength: number;
  }> {
    try {
      const songs = await this.loadSongsFromCSV();
      
      // Calcular estatísticas
      const years = songs.map(s => s.year);
      const yearRange = {
        min: Math.min(...years),
        max: Math.max(...years)
      };

      // Top artistas
      const artistCounts: { [key: string]: number } = {};
      songs.forEach(song => {
        artistCounts[song.artist] = (artistCounts[song.artist] || 0) + 1;
      });

      const topArtists = Object.entries(artistCounts)
        .map(([artist, count]) => ({ artist, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Média de tamanho das letras
      const avgLyricsLength = songs.reduce((sum, song) => sum + song.lyrics.length, 0) / songs.length;

      return {
        totalSongs: songs.length,
        yearRange,
        topArtists,
        avgLyricsLength: Math.round(avgLyricsLength)
      };

    } catch (error) {
      console.error('Erro ao calcular estatísticas:', error);
      throw error;
    }
  }

  /**
   * Filtrar músicas por critérios
   */
  static filterSongs(
    songs: Song[],
    filters: {
      year?: number;
      yearRange?: { min: number; max: number };
      artist?: string;
      title?: string;
      minLyricsLength?: number;
      excludeIds?: number[];
    }
  ): Song[] {
    return songs.filter(song => {
      // Filtro por ano específico
      if (filters.year && song.year !== filters.year) {
        return false;
      }

      // Filtro por faixa de anos
      if (filters.yearRange) {
        if (song.year < filters.yearRange.min || song.year > filters.yearRange.max) {
          return false;
        }
      }

      // Filtro por artista
      if (filters.artist) {
        if (!song.artist.toLowerCase().includes(filters.artist.toLowerCase())) {
          return false;
        }
      }

      // Filtro por título
      if (filters.title) {
        if (!song.title.toLowerCase().includes(filters.title.toLowerCase())) {
          return false;
        }
      }

      // Filtro por tamanho mínimo da letra
      if (filters.minLyricsLength && song.lyrics.length < filters.minLyricsLength) {
        return false;
      }

      // Excluir IDs específicos
      if (filters.excludeIds && filters.excludeIds.includes(song.id)) {
        return false;
      }

      return true;
    });
  }
}
