
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle, Music } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ClassificationResult {
  category: string;
  probability: number;
  severity: 'low' | 'medium' | 'high';
}

const ContentClassifier = () => {
  const [lyrics, setLyrics] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<ClassificationResult[]>([]);

  const categories = [
    { name: 'Misoginia', color: 'bg-red-500' },
    { name: 'Violência', color: 'bg-orange-500' },
    { name: 'Depressão', color: 'bg-blue-500' },
    { name: 'Suicídio', color: 'bg-purple-500' },
    { name: 'Racismo', color: 'bg-yellow-500' },
    { name: 'Homofobia', color: 'bg-pink-500' },
    { name: 'Conteúdo Limpo', color: 'bg-green-500' }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const simulateAnalysis = async () => {
    setIsAnalyzing(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock classification results
    const mockResults: ClassificationResult[] = [
      { category: 'Conteúdo Limpo', probability: 85, severity: 'low' },
      { category: 'Violência', probability: 12, severity: 'low' },
      { category: 'Depressão', probability: 8, severity: 'low' },
      { category: 'Misoginia', probability: 3, severity: 'low' },
      { category: 'Racismo', probability: 2, severity: 'low' },
      { category: 'Homofobia', probability: 1, severity: 'low' },
      { category: 'Suicídio', probability: 1, severity: 'low' }
    ];
    
    setResults(mockResults);
    setIsAnalyzing(false);
    
    toast({
      title: "Análise Concluída",
      description: "A classificação do conteúdo foi realizada com sucesso.",
    });
  };

  const handleAnalyze = () => {
    if (!lyrics.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira a letra da música para análise.",
        variant: "destructive",
      });
      return;
    }
    
    simulateAnalysis();
  };

  const getOverallSafety = () => {
    if (results.length === 0) return null;
    
    const cleanContent = results.find(r => r.category === 'Conteúdo Limpo');
    if (cleanContent && cleanContent.probability > 70) {
      return { status: 'safe', message: 'Conteúdo considerado seguro' };
    }
    
    const highRiskCategories = results.filter(r => 
      r.category !== 'Conteúdo Limpo' && r.probability > 30
    );
    
    if (highRiskCategories.length > 0) {
      return { status: 'warning', message: 'Conteúdo pode conter elementos sensíveis' };
    }
    
    return { status: 'moderate', message: 'Conteúdo com baixo risco' };
  };

  const overallSafety = getOverallSafety();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Classificador de Conteúdo</h2>
        <p className="text-muted-foreground">
          Analise letras de música em tempo real para detectar conteúdo sensível
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Music className="h-5 w-5" />
              Entrada de Texto
            </CardTitle>
            <CardDescription>
              Cole ou digite a letra da música para análise
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Cole aqui a letra da música..."
              value={lyrics}
              onChange={(e) => setLyrics(e.target.value)}
              className="min-h-[200px]"
            />
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                {lyrics.length} caracteres
              </span>
              <Button 
                onClick={handleAnalyze}
                disabled={isAnalyzing || !lyrics.trim()}
              >
                {isAnalyzing ? 'Analisando...' : 'Analisar Conteúdo'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {overallSafety?.status === 'safe' && <CheckCircle className="h-5 w-5 text-green-500" />}
              {overallSafety?.status === 'warning' && <AlertCircle className="h-5 w-5 text-red-500" />}
              {overallSafety?.status === 'moderate' && <AlertCircle className="h-5 w-5 text-yellow-500" />}
              Resultados da Análise
            </CardTitle>
            <CardDescription>
              {overallSafety?.message || 'Aguardando análise...'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isAnalyzing ? (
              <div className="space-y-4">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
                <p className="text-center text-muted-foreground">
                  Processando com CNN...
                </p>
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-4">
                {results.map((result, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{result.category}</span>
                        <Badge 
                          variant="outline"
                          className={getSeverityColor(result.severity)}
                        >
                          {result.severity}
                        </Badge>
                      </div>
                      <span className="text-sm font-medium">
                        {result.probability}%
                      </span>
                    </div>
                    <Progress 
                      value={result.probability} 
                      className="h-2"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Music className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>Nenhuma análise realizada ainda</p>
                <p className="text-sm">Insira uma letra de música para começar</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Category Legend */}
      <Card>
        <CardHeader>
          <CardTitle>Categorias de Classificação</CardTitle>
          <CardDescription>
            Entenda as diferentes categorias analisadas pelo modelo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {categories.map((category, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${category.color}`}></div>
                <span className="text-sm font-medium">{category.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContentClassifier;
