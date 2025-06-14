
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, Database, CheckCircle, AlertCircle } from 'lucide-react';
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
      const { data: songsCount } = await supabase
        .from('songs')
        .select('*', { count: 'exact', head: true });

      const { data: labelsCount } = await supabase
        .from('manual_labels')
        .select('*', { count: 'exact', head: true });

      const stats: Dataset[] = [];
      
      if (songsCount && songsCount.length > 0) {
        stats.push({
          id: 1,
          name: "Dataset Principal (Kaggle)",
          totalSongs: songsCount.length,
          status: "Ativo",
          lastUpdate: new Date().toLocaleDateString('pt-BR')
        });
      }

      if (labelsCount && labelsCount.length > 0) {
        stats.push({
          id: 2,
          name: "Rótulos Manuais",
          totalSongs: labelsCount.length,
          status: "Ativo", 
          lastUpdate: new Date().toLocaleDateString('pt-BR')
        });
      }

      setDatasets(stats);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const parseCSV = (csvText: string) => {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    
    console.log('Headers encontrados:', headers);
    
    const songs = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // Parse CSV simples - pode precisar de ajustes dependendo do formato exato
      const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
      
      if (values.length >= headers.length) {
        const song: any = {};
        headers.forEach((header, index) => {
          song[header.toLowerCase()] = values[index] || '';
        });
        
        // Mapear para nossa estrutura de banco
        const mappedSong = {
          year: parseInt(song.year) || parseInt(song.ano) || new Date().getFullYear(),
          rank: parseInt(song.rank) || parseInt(song.ranking) || null,
          artist: song.artist || song.artista || 'Desconhecido',
          title: song.title || song.titulo || song.song || 'Sem título',
          lyrics: song.lyrics || song.letra || song.lyric || ''
        };
        
        songs.push(mappedSong);
      }
    }
    
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
      const songs = parseCSV(text);
      
      console.log(`Processando ${songs.length} músicas...`);
      
      // Upload em lotes para evitar timeouts
      const batchSize = 50;
      const totalBatches = Math.ceil(songs.length / batchSize);
      
      for (let i = 0; i < totalBatches; i++) {
        const start = i * batchSize;
        const end = Math.min(start + batchSize, songs.length);
        const batch = songs.slice(start, end);
        
        const { error } = await supabase
          .from('songs')
          .insert(batch);
          
        if (error) {
          console.error('Erro no lote', i + 1, ':', error);
          throw error;
        }
        
        const progress = Math.round(((i + 1) / totalBatches) * 100);
        setUploadProgress(progress);
      }

      toast({
        title: "Upload Concluído",
        description: `${songs.length} músicas foram carregadas com sucesso.`,
      });
      
      await loadDatasetStats();
      
    } catch (error) {
      console.error('Erro no upload:', error);
      toast({
        title: "Erro no Upload",
        description: "Ocorreu um erro ao processar o arquivo. Verifique o formato.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
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

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload de Dataset CSV
          </CardTitle>
          <CardDescription>
            Dataset: Top 100 Songs & Lyrics By Year (1959–2023) do Kaggle
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium mb-2">Upload do Dataset CSV</p>
            <p className="text-sm text-muted-foreground mb-4">
              Formato esperado: year, rank, artist, title, lyrics
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
