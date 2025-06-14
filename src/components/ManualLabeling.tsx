import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Music, Save, SkipForward, CheckCircle, Upload, Filter, Calendar, Search, TrendingUp } from 'lucide-react';
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
  const [filteredSongs, setFilteredSongs] = useState<Song[]>([]);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [justification, setJustification] = useState('');
  const [severityLevel, setSeverityLevel] = useState('');
  const [labeledCount, setLabeledCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<string>('recent');
  const [selectedDecade, setSelectedDecade] = useState<string>('all');
  const [artistFilter, setArtistFilter] = useState('');
  const [titleFilter, setTitleFilter] = useState('');
  const [sortBy, setSortBy] = useState<string>('year_desc');
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [selectedSongId, setSelectedSongId] = useState<string>('');

  const severityLevels = [
    { value: 'baixo', label: 'Baixo (0-33)', description: 'Conteúdo com pouca ou nenhuma misoginia' },
    { value: 'medio', label: 'Médio (34-66)', description: 'Presença moderada de elementos misóginos' },
    { value: 'alto', label: 'Alto (67-100)', description: 'Conteúdo claramente misógino ou objetificação explícita' }
  ];

  const yearRanges = [
    { value: 'recent', label: 'Mais Recentes (2010-2023)', description: 'Músicas contemporâneas - maior potencial misógino' },
    { value: '2000s', label: 'Anos 2000-2009', description: 'Era do hip-hop mainstream' },
    { value: '1990s', label: 'Anos 1990-1999', description: 'Grunge, rap e pop' },
    { value: 'classic', label: 'Clássicas (1959-1989)', description: 'Músicas históricas' },
    { value: 'all', label: 'Todos os Anos', description: 'Sem filtro de período' }
  ];

  const sortOptions = [
    { value: 'year_desc', label: 'Ano (Mais Recente)' },
    { value: 'year_asc', label: 'Ano (Mais Antigo)' },
    { value: 'artist_asc', label: 'Artista (A-Z)' },
    { value: 'title_asc', label: 'Título (A-Z)' },
    { value: 'rank_asc', label: 'Ranking (Melhor Posição)' }
  ];

  useEffect(() => {
    loadSongs();
    loadLabeledCount();
  }, []);

  useEffect(() => {
    filterAndSortSongs();
  }, [songs, selectedYear, selectedDecade, artistFilter, titleFilter, sortBy]);

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
        .order('year', { ascending: false })
        .limit(1000); // Aumentar limite para mais variedade

      if (error) throw error;
      
      setSongs(data || []);
      
      // Extrair anos únicos disponíveis
      const years = [...new Set((data || []).map(song => song.year))].sort((a, b) => b - a);
      setAvailableYears(years);
      
      console.log(`${data?.length || 0} músicas carregadas, anos disponíveis:`, years);
      
      // Log de músicas recentes para debug
      const recentSongs = (data || []).filter(song => song.year >= 2010);
      console.log(`Músicas recentes (2010+): ${recentSongs.length}`);
      console.log('Exemplos de artistas recentes:', recentSongs.slice(0, 10).map(s => `${s.artist} - ${s.title} (${s.year})`));
      
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

  const filterAndSortSongs = () => {
    let filtered = [...songs];
    
    // Filtro por período/ano
    if (selectedYear !== 'all') {
      switch (selectedYear) {
        case 'recent':
          filtered = filtered.filter(song => song.year >= 2010);
          break;
        case '2000s':
          filtered = filtered.filter(song => song.year >= 2000 && song.year <= 2009);
          break;
        case '1990s':
          filtered = filtered.filter(song => song.year >= 1990 && song.year <= 1999);
          break;
        case 'classic':
          filtered = filtered.filter(song => song.year >= 1959 && song.year <= 1989);
          break;
      }
    }

    // Filtro por década específica
    if (selectedDecade !== 'all') {
      const decade = parseInt(selectedDecade);
      filtered = filtered.filter(song => Math.floor(song.year / 10) * 10 === decade);
    }
    
    // Filtro por artista
    if (artistFilter.trim()) {
      filtered = filtered.filter(song => 
        song.artist.toLowerCase().includes(artistFilter.toLowerCase())
      );
    }
    
    // Filtro por título
    if (titleFilter.trim()) {
      filtered = filtered.filter(song => 
        song.title.toLowerCase().includes(titleFilter.toLowerCase())
      );
    }
    
    // Ordenação
    switch (sortBy) {
      case 'year_desc':
        filtered.sort((a, b) => b.year - a.year);
        break;
      case 'year_asc':
        filtered.sort((a, b) => a.year - b.year);
        break;
      case 'artist_asc':
        filtered.sort((a, b) => a.artist.localeCompare(b.artist));
        break;
      case 'title_asc':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'rank_asc':
        filtered.sort((a, b) => (a.rank || 999) - (b.rank || 999));
        break;
    }
    
    setFilteredSongs(filtered);
    setCurrentSongIndex(0);
    setSelectedSongId('');
    
    console.log(`Filtros aplicados - Período: ${selectedYear}, Artista: "${artistFilter}", Título: "${titleFilter}", ${filtered.length} músicas encontradas`);
    
    // Log específico para Post Malone
    const postMalone = filtered.filter(song => song.artist.toLowerCase().includes('post malone'));
    if (postMalone.length > 0) {
      console.log('Post Malone encontrado:', postMalone.map(s => `${s.title} (${s.year})`));
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

  const handleSongSelection = (songId: string) => {
    const songIndex = filteredSongs.findIndex(song => song.id === parseInt(songId));
    if (songIndex !== -1) {
      setCurrentSongIndex(songIndex);
      setSelectedSongId(songId);
      // Reset form
      setScore(0);
      setJustification('');
      setSeverityLevel('');
    }
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
      const currentSong = filteredSongs[currentSongIndex];
      
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
    if (currentSongIndex < filteredSongs.length - 1) {
      const nextIndex = currentSongIndex + 1;
      setCurrentSongIndex(nextIndex);
      setSelectedSongId(filteredSongs[nextIndex].id.toString());
      setScore(0);
      setJustification('');
      setSeverityLevel('');
    } else {
      toast({
        title: "Fim das Músicas",
        description: "Todas as músicas filtradas foram processadas!",
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

  if (filteredSongs.length === 0) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Rotulagem Manual - Misoginia</h2>
            <p className="text-muted-foreground">
              Classifique as músicas de acordo com o conteúdo misógino
            </p>
          </div>
        </div>

        {/* Filtros Avançados */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros Avançados de Seleção
            </CardTitle>
            <CardDescription>
              Filtre músicas por período, artista e características específicas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  <TrendingUp className="h-4 w-4 inline mr-1" />
                  Período de Interesse
                </label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {yearRanges.map(range => (
                      <SelectItem key={range.value} value={range.value}>
                        <div>
                          <div className="font-medium">{range.label}</div>
                          <div className="text-xs text-muted-foreground">{range.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">
                  <Search className="h-4 w-4 inline mr-1" />
                  Buscar Artista
                </label>
                <Input
                  placeholder="ex: Post Malone, Drake..."
                  value={artistFilter}
                  onChange={(e) => setArtistFilter(e.target.value)}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Buscar Título</label>
                <Input
                  placeholder="Nome da música..."
                  value={titleFilter}
                  onChange={(e) => setTitleFilter(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center p-8">
          <Music className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Nenhuma música encontrada</h3>
          <p className="text-muted-foreground">
            Ajuste os filtros acima para encontrar músicas específicas ou artistas como Post Malone.
          </p>
        </div>
      </div>
    );
  }

  const currentSong = filteredSongs[currentSongIndex];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Rotulagem Manual - Misoginia</h2>
          <p className="text-muted-foreground">
            Priorize músicas recentes (2010+) - maior potencial de conteúdo misógino
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <Badge variant="outline" className="mb-2">
              <CheckCircle className="h-4 w-4 mr-1" />
              {labeledCount} rotuladas
            </Badge>
            <p className="text-sm text-muted-foreground">
              Música {currentSongIndex + 1} de {filteredSongs.length} 
              {selectedYear !== 'all' && ` (${yearRanges.find(r => r.value === selectedYear)?.label})`}
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

      {/* Filtros Avançados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Seleção Inteligente de Músicas
          </CardTitle>
          <CardDescription>
            Filtre e encontre músicas específicas - priorize conteúdo contemporâneo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                <TrendingUp className="h-4 w-4 inline mr-1" />
                Período de Interesse
              </label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {yearRanges.map(range => (
                    <SelectItem key={range.value} value={range.value}>
                      <div>
                        <div className="font-medium">{range.label}</div>
                        <div className="text-xs text-muted-foreground">{range.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">
                <Search className="h-4 w-4 inline mr-1" />
                Buscar Artista
              </label>
              <Input
                placeholder="ex: Post Malone, Drake, Eminem..."
                value={artistFilter}
                onChange={(e) => setArtistFilter(e.target.value)}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Buscar Título</label>
              <Input
                placeholder="Nome da música..."
                value={titleFilter}
                onChange={(e) => setTitleFilter(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Ordenar Por</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Seleção Direta de Música */}
          <div className="mt-4">
            <label className="text-sm font-medium mb-2 block">
              <Music className="h-4 w-4 inline mr-1" />
              Selecionar Música Específica
            </label>
            <Select value={selectedSongId} onValueChange={handleSongSelection}>
              <SelectTrigger>
                <SelectValue placeholder="Escolha uma música da lista filtrada..." />
              </SelectTrigger>
              <SelectContent>
                {filteredSongs.slice(0, 100).map((song, index) => (
                  <SelectItem key={song.id} value={song.id.toString()}>
                    <div className="flex items-center justify-between w-full">
                      <span>{song.artist} - {song.title}</span>
                      <Badge variant="outline" className="ml-2">
                        {song.year}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informações da Música */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Music className="h-5 w-5" />
              {currentSong.title}
            </CardTitle>
            <CardDescription className="flex items-center gap-4">
              <span>{currentSong.artist} • {currentSong.year}</span>
              {currentSong.rank && <Badge variant="secondary">Rank #{currentSong.rank}</Badge>}
              {currentSong.year >= 2010 && <Badge className="bg-green-600">Recente</Badge>}
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
              Analise cuidadosamente - músicas recentes podem ter conteúdo mais sutil
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
                placeholder="Descreva os elementos misóginos identificados, linguagem contemporânea, referências implícitas..."
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
