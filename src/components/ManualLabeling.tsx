import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Music, Save, SkipForward, CheckCircle, Upload } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Song {
  id: number;
  year: number;
  rank: number | null;
  artist: string;
  title: string;
  lyrics: string;
}

const ManualLabeling = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [justification, setJustification] = useState('');
  const [severityLevel, setSeverityLevel] = useState('');
  const [labeledCount, setLabeledCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const severityLevels = [
    { value: 'baixo', label: 'Baixo (0-33)', description: 'Conteúdo com pouca ou nenhuma misoginia' },
    { value: 'medio', label: 'Médio (34-66)', description: 'Presença moderada de elementos misóginos' },
    { value: 'alto', label: 'Alto (67-100)', description: 'Conteúdo claramente misógino ou objetificação explícita' }
  ];

  useEffect(() => {
    loadSongs();
    loadLabeledCount();
  }, []);

  const loadSongs = async () => {
    try {
      // Carregar músicas que ainda não foram rotuladas
      const { data: labeledSongs } = await supabase
        .from('manual_labels')
        .select('song_id')
        .eq('theme', 'Misoginia');

      const labeledIds = labeledSongs?.map(l => l.song_id) || [];

      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .not('id', 'in', `(${labeledIds.length > 0 ? labeledIds.join(',') : '0'})`)
        .order('year', { ascending: true })
        .limit(100);

      if (error) throw error;
      
      setSongs(data || []);
    } catch (error) {
      console.error('Erro ao carregar músicas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as músicas.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadLabeledCount = async () => {
    try {
      const { count } = await supabase
        .from('manual_labels')
        .select('*', { count: 'exact', head: true })
        .eq('theme', 'Misoginia');
      
      setLabeledCount(count || 0);
    } catch (error) {
      console.error('Erro ao carregar contagem:', error);
    }
  };

  const getSeverityFromScore = (score: number): string => {
    if (score <= 33) return 'baixo';
    if (score <= 66) return 'medio';
    return 'alto';
  };

  const getScoreFromSeverity = (severity: string): number => {
    switch (severity) {
      case 'baixo': return 16;
      case 'medio': return 50;
      case 'alto': return 83;
      default: return 0;
    }
  };

  const handleSeverityChange = (value: string) => {
    setSeverityLevel(value);
    setScore(getScoreFromSeverity(value));
  };

  const handleScoreChange = (value: number[]) => {
    setScore(value[0]);
    setSeverityLevel(getSeverityFromScore(value[0]));
  };

  const saveLabel = async () => {
    if (!severityLevel) {
      toast({
        title: "Nível Obrigatório",
        description: "Por favor, selecione um nível de severidade antes de salvar.",
        variant: "destructive"
      });
      return;
    }

    try {
      const currentSong = songs[currentSongIndex];
      
      const { error } = await supabase
        .from('manual_labels')
        .insert({
          song_id: currentSong.id,
          theme: 'Misoginia',
          score: score / 100, // Converter para escala 0-1
          justification: justification.trim() || null
        });

      if (error) throw error;

      toast({
        title: "Rótulo Salvo",
        description: `Música "${currentSong.title}" rotulada como ${severityLevel}.`,
      });

      nextSong();
      setLabeledCount(prev => prev + 1);
      
    } catch (error) {
      console.error('Erro ao salvar rótulo:', error);
      toast({
        title: "Erro ao Salvar",
        description: "Não foi possível salvar o rótulo.",
        variant: "destructive"
      });
    }
  };

  const nextSong = () => {
    if (currentSongIndex < songs.length - 1) {
      setCurrentSongIndex(currentSongIndex + 1);
      setScore(0);
      setJustification('');
      setSeverityLevel('');
    } else {
      toast({
        title: "Rotulagem Completa",
        description: "Todas as músicas disponíveis foram rotuladas!",
      });
    }
  };

  const skipSong = () => {
    nextSong();
  };

  const importExistingLabels = async (jsonData: string) => {
    try {
      const labels = JSON.parse(jsonData);
      const imports = [];
      
      for (const [songTitle, data] of Object.entries(labels)) {
        // Extrair artista e título da string "Artist – Title"
        const [artist, title] = songTitle.split(' – ');
        if (!artist || !title) continue;
        
        // Buscar a música no banco
        const { data: songData } = await supabase
          .from('songs')
          .select('id')
          .ilike('artist', `%${artist.trim()}%`)
          .ilike('title', `%${title.trim()}%`)
          .limit(1);
          
        if (songData && songData.length > 0) {
          const misogyniaScore = (data as any).categories?.misogyny || 0;
          imports.push({
            song_id: songData[0].id,
            theme: 'Misoginia',
            score: misogyniaScore,
            justification: (data as any).notes || null
          });
        }
      }
      
      if (imports.length > 0) {
        const { error } = await supabase
          .from('manual_labels')
          .insert(imports);
          
        if (error) throw error;
        
        toast({
          title: "Importação Concluída",
          description: `${imports.length} rótulos importados com sucesso.`,
        });
        
        await loadLabeledCount();
        await loadSongs();
      }
      
    } catch (error) {
      console.error('Erro na importação:', error);
      toast({
        title: "Erro na Importação",
        description: "Verifique o formato do JSON.",
        variant: "destructive"
      });
    }
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      importExistingLabels(content);
    };
    reader.readAsText(file);
    
    // Reset input
    event.target.value = '';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando músicas...</p>
        </div>
      </div>
    );
  }

  if (songs.length === 0) {
    return (
      <div className="text-center p-8">
        <Music className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">Nenhuma música disponível</h3>
        <p className="text-muted-foreground">
          Faça upload do dataset na aba "Dados" para começar a rotulagem.
        </p>
      </div>
    );
  }

  const currentSong = songs[currentSongIndex];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Rotulagem Manual - Misoginia</h2>
          <p className="text-muted-foreground">
            Classifique as músicas de acordo com o conteúdo misógino
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <Badge variant="outline" className="mb-2">
              <CheckCircle className="h-4 w-4 mr-1" />
              {labeledCount} rotuladas
            </Badge>
            <p className="text-sm text-muted-foreground">
              Música {currentSongIndex + 1} de {songs.length}
            </p>
          </div>
          <div>
            <input
              type="file"
              accept=".json"
              onChange={handleFileImport}
              className="hidden"
              id="json-import"
            />
            <label htmlFor="json-import">
              <Button variant="outline" asChild>
                <span>
                  <Upload className="h-4 w-4 mr-2" />
                  Importar JSON
                </span>
              </Button>
            </label>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informações da Música */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Music className="h-5 w-5" />
              {currentSong.title}
            </CardTitle>
            <CardDescription>
              {currentSong.artist} • {currentSong.year}
              {currentSong.rank && ` • Rank #${currentSong.rank}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Letra da Música:</h4>
                <div className="bg-muted p-4 rounded-lg max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm">
                    {currentSong.lyrics || 'Letra não disponível'}
                  </pre>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rotulagem */}
        <Card>
          <CardHeader>
            <CardTitle>Classificação de Misoginia</CardTitle>
            <CardDescription>
              Atribua um nível e pontuação para conteúdo misógino
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Nível de Misoginia *
              </label>
              <Select value={severityLevel} onValueChange={handleSeverityChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o nível..." />
                </SelectTrigger>
                <SelectContent>
                  {severityLevels.map(level => (
                    <SelectItem key={level.value} value={level.value}>
                      <div>
                        <div className="font-medium">{level.label}</div>
                        <div className="text-xs text-muted-foreground">{level.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Pontuação Precisa: {score}/100
              </label>
              <Slider
                value={[score]}
                onValueChange={handleScoreChange}
                max={100}
                step={1}
                className="mb-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0 - Sem misoginia</span>
                <span>50 - Moderada</span>
                <span>100 - Extremamente misógino</span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Justificativa e Observações
              </label>
              <Textarea
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                placeholder="Descreva os elementos misóginos identificados, termos específicos, contexto..."
                rows={4}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={saveLabel} className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                Salvar Rótulo
              </Button>
              <Button variant="outline" onClick={skipSong}>
                <SkipForward className="h-4 w-4 mr-2" />
                Pular
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ManualLabeling;
