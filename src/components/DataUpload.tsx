
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, Database, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Dataset {
  id: number;
  name: string;
  totalSongs: number;
  status: string;
  lastUpdate: string;
}

const DataUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [datasets, setDatasets] = useState<Dataset[]>([]);

  useEffect(() => {
    loadDatasetStats();
  }, []);

  const loadDatasetStats = async () => {
    try {
      const { data: songsData, count: songsCount } = await supabase
        .from('songs')
        .select('*', { count: 'exact', head: true });

      const { data: labelsData, count: labelsCount } = await supabase
        .from('manual_labels')
        .select('*', { count: 'exact', head: true });

      const stats: Dataset[] = [];
      
      if (songsCount && songsCount > 0) {
        stats.push({
          id: 1,
          name: "Dataset Principal (Kaggle)",
          totalSongs: songsCount,
          status: "Ativo",
          lastUpdate: new Date().toLocaleDateString('pt-BR')
        });
      }

      if (labelsCount && labelsCount > 0) {
        stats.push({
          id: 2,
          name: "Rótulos Manuais",
          totalSongs: labelsCount,
          status: "Ativo", 
          lastUpdate: new Date().toLocaleDateString('pt-BR')
        });
      }

      setDatasets(stats);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const parseKaggleCSV = (csvText: string) => {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    
    console.log('Headers do Kaggle encontrados:', headers);
    
    // Mapeamento específico para o dataset do Kaggle
    const expectedHeaders = {
      artist: 'Artist',
      title: 'Song Title', 
      lyrics: 'Lyrics',
      year: 'Year',
      rank: 'Rank'
    };
    
    const songs = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // Parse CSV robusto para lidar com vírgulas dentro de aspas
      const values = [];
      let current = '';
      let inQuotes = false;
      
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim().replace(/^"|"$/g, ''));
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim().replace(/^"|"$/g, ''));
      
      if (values.length >= headers.length) {
        const songData: any = {};
        headers.forEach((header, index) => {
          songData[header] = values[index] || '';
        });
        
        // Mapear para nossa estrutura usando os headers corretos do Kaggle
        const mappedSong = {
          artist: songData[expectedHeaders.artist] || songData['Artist'] || 'Desconhecido',
          title: songData[expectedHeaders.title] || songData['Song Title'] || songData['Song'] || 'Sem título',
          lyrics: songData[expectedHeaders.lyrics] || songData['Lyrics'] || '',
          year: parseInt(songData[expectedHeaders.year] || songData['Year']) || new Date().getFullYear(),
          rank: parseInt(songData[expectedHeaders.rank] || songData['Rank']) || null
        };
        
        // Validar se tem dados essenciais
        if (mappedSong.artist !== 'Desconhecido' && mappedSong.title !== 'Sem título') {
          songs.push(mappedSong);
        }
      }
    }
    
    console.log(`${songs.length} músicas válidas processadas`);
    return songs;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast({
        title: "Formato Inválido",
        description: "Por favor, selecione um arquivo CSV.",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const text = await file.text();
      const songs = parseKaggleCSV(text);
      
      if (songs.length === 0) {
        throw new Error('Nenhuma música válida encontrada no arquivo');
      }
      
      console.log(`Processando ${songs.length} músicas válidas...`);
      
      // Upload em lotes para evitar timeouts
      const batchSize = 100;
      const totalBatches = Math.ceil(songs.length / batchSize);
      let successCount = 0;
      let errorCount = 0;
      
      for (let i = 0; i < totalBatches; i++) {
        const start = i * batchSize;
        const end = Math.min(start + batchSize, songs.length);
        const batch = songs.slice(start, end);
        
        try {
          const { error } = await supabase
            .from('songs')
            .insert(batch);
            
          if (error) {
            console.error('Erro no lote', i + 1, ':', error);
            errorCount += batch.length;
          } else {
            successCount += batch.length;
          }
        } catch (batchError) {
          console.error('Erro no lote', i + 1, ':', batchError);
          errorCount += batch.length;
        }
        
        const progress = Math.round(((i + 1) / totalBatches) * 100);
        setUploadProgress(progress);
      }

      if (successCount > 0) {
        toast({
          title: "Upload Concluído",
          description: `${successCount} músicas carregadas com sucesso${errorCount > 0 ? ` (${errorCount} com erro)` : ''}.`,
        });
      } else {
        toast({
          title: "Erro no Upload", 
          description: "Não foi possível carregar nenhuma música. Verifique as permissões do banco.",
          variant: "destructive"
        });
      }
      
      await loadDatasetStats();
      
    } catch (error) {
      console.error('Erro no upload:', error);
      toast({
        title: "Erro no Upload",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao processar o arquivo.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      event.target.value = '';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ativo': return 'bg-green-100 text-green-800 border-green-200';
      case 'Processando': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Erro': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Ativo': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'Processando': return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'Erro': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Gerenciamento de Dados</h2>
        <p className="text-muted-foreground">
          Faça upload do dataset do Kaggle (Top 100 Songs & Lyrics) em formato CSV
        </p>
      </div>

      {/* Expected Format Info */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Info className="h-5 w-5" />
            Formato Esperado do CSV
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-blue-700 space-y-2">
            <p><strong>Colunas obrigatórias:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><code>Artist</code> - Nome do artista</li>
              <li><code>Song Title</code> - Título da música</li>
              <li><code>Lyrics</code> - Letra da música</li>
              <li><code>Year</code> - Ano de lançamento</li>
              <li><code>Rank</code> - Posição no ranking (opcional)</li>
            </ul>
            <p className="mt-3"><strong>Dataset recomendado:</strong> Top 100 Songs & Lyrics By Year (1959–2023) do Kaggle</p>
          </div>
        </CardContent>
      </Card>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload de Dataset CSV
          </CardTitle>
          <CardDescription>
            Carregue o arquivo CSV do dataset do Kaggle
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium mb-2">Upload do Dataset CSV</p>
            <p className="text-sm text-muted-foreground mb-4">
              O sistema irá processar automaticamente as colunas do Kaggle
            </p>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="hidden"
              id="csv-upload"
            />
            <label htmlFor="csv-upload">
              <Button disabled={isUploading} asChild>
                <span>{isUploading ? 'Processando...' : 'Selecionar Arquivo CSV'}</span>
              </Button>
            </label>
          </div>

          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progresso do upload</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Datasets List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Datasets Carregados
          </CardTitle>
          <CardDescription>
            Datasets disponíveis no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {datasets.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Nenhum dataset carregado ainda. Faça upload do arquivo CSV do Kaggle.
              </p>
            ) : (
              datasets.map((dataset) => (
                <div key={dataset.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    {getStatusIcon(dataset.status)}
                    <div>
                      <div className="font-medium">{dataset.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {dataset.totalSongs} registros
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className={getStatusColor(dataset.status)}>
                      {dataset.status}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {dataset.lastUpdate}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataUpload;
