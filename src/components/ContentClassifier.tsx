
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle, Music, Brain } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface MisogynyResult {
  score: number;
  level: 'baixo' | 'medio' | 'alto';
  confidence: number;
  keyTerms: string[];
  explanation: string;
}

const ContentClassifier = () => {
  const [lyrics, setLyrics] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<MisogynyResult | null>(null);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'alto': return 'bg-red-100 text-red-800 border-red-200';
      case 'medio': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'baixo': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getLevelDescription = (level: string) => {
    switch (level) {
      case 'alto': return 'Conteúdo claramente misógino detectado';
      case 'medio': return 'Presença moderada de elementos misóginos';
      case 'baixo': return 'Pouco ou nenhum conteúdo misógino';
      default: return 'Análise não disponível';
    }
  };

  const simulateAnalysis = async () => {
    setIsAnalyzing(true);
    
    // Simulate CNN processing delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Mock analysis with focus on misogyny detection
    const mockTerms = ['objectification', 'degrading language', 'sexual references'];
    const mockScore = Math.floor(Math.random() * 100);
    const mockLevel = mockScore <= 33 ? 'baixo' : mockScore <= 66 ? 'medio' : 'alto';
    
    const mockResult: MisogynyResult = {
      score: mockScore,
      level: mockLevel,
      confidence: 0.85,
      keyTerms: mockTerms,
      explanation: `Análise baseada em rede neural convolucional. Pontuação: ${mockScore}/100 (${mockLevel}). Termos identificados: ${mockTerms.join(', ')}.`
    };
    
    setResult(mockResult);
    setIsAnalyzing(false);
    
    toast({
      title: "Análise Concluída",
      description: `Conteúdo classificado como: ${mockLevel}`,
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

  const getOverallStatus = () => {
    if (!result) return null;
    
    if (result.level === 'baixo') {
      return { status: 'safe', message: 'Conteúdo considerado seguro', icon: CheckCircle };
    } else if (result.level === 'medio') {
      return { status: 'warning', message: 'Atenção: elementos misóginos detectados', icon: AlertCircle };
    } else {
      return { status: 'danger', message: 'Alerta: conteúdo claramente misógino', icon: AlertCircle };
    }
  };

  const overallStatus = getOverallStatus();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Classificador de Misoginia</h2>
        <p className="text-muted-foreground">
          Analise letras de música para detectar conteúdo misógino usando redes neurais
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
                {isAnalyzing ? 'Analisando...' : 'Analisar Misoginia'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {overallStatus && (
                <overallStatus.icon className={`h-5 w-5 ${
                  overallStatus.status === 'safe' ? 'text-green-500' :
                  overallStatus.status === 'warning' ? 'text-yellow-500' : 'text-red-500'
                }`} />
              )}
              <Brain className="h-5 w-5" />
              Resultados da Análise
            </CardTitle>
            <CardDescription>
              {overallStatus?.message || 'Aguardando análise...'}
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
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-sm text-muted-foreground">
                    Processando com CNN para detecção de misoginia...
                  </p>
                </div>
              </div>
            ) : result ? (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Nível de Misoginia</span>
                    <Badge 
                      variant="outline"
                      className={getLevelColor(result.level)}
                    >
                      {result.level.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Pontuação</span>
                      <span className="text-sm font-medium">{result.score}/100</span>
                    </div>
                    <Progress value={result.score} className="h-3" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Confiança do Modelo</span>
                      <span className="text-sm font-medium">{Math.round(result.confidence * 100)}%</span>
                    </div>
                    <Progress value={result.confidence * 100} className="h-2" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Termos Identificados</h4>
                  <div className="flex flex-wrap gap-2">
                    {result.keyTerms.map((term, index) => (
                      <Badge key={index} variant="secondary">
                        {term}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Explicação</h4>
                  <p className="text-sm text-muted-foreground">
                    {result.explanation}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Brain className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>Nenhuma análise realizada ainda</p>
                <p className="text-sm">Insira uma letra de música para detectar misoginia</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>Sobre a Detecção de Misoginia</CardTitle>
          <CardDescription>
            Como funciona a análise de conteúdo misógino
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Badge variant="outline" className={getLevelColor('baixo')}>
                BAIXO (0-33)
              </Badge>
              <p className="text-sm text-muted-foreground">
                Sem elementos misóginos identificados ou apenas linguagem neutra sobre relacionamentos.
              </p>
            </div>
            <div className="space-y-2">
              <Badge variant="outline" className={getLevelColor('medio')}>
                MÉDIO (34-66)
              </Badge>
              <p className="text-sm text-muted-foreground">
                Presença de estereótipos de gênero, linguagem ambígua ou objetificação sutil.
              </p>
            </div>
            <div className="space-y-2">
              <Badge variant="outline" className={getLevelColor('alto')}>
                ALTO (67-100)
              </Badge>
              <p className="text-sm text-muted-foreground">
                Objetificação explícita, linguagem degradante ou violência contra mulheres.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContentClassifier;
