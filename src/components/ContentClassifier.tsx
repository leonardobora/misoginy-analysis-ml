
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Music, Brain, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cnnModel, PredictionResult } from '@/services/CNNModel';

const ContentClassifier = () => {
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [modelReady, setModelReady] = useState(false);
  const [modelInfo, setModelInfo] = useState<any>(null);

  useEffect(() => {
    initializeModel();
  }, []);

  const initializeModel = async () => {
    try {
      console.log('Carregando modelo CNN...');
      await cnnModel.loadModel();
      const info = cnnModel.getModelInfo();
      setModelInfo(info);
      setModelReady(true);
      
      toast({
        title: "Modelo Carregado",
        description: "CNN pronto para classificação local.",
      });
    } catch (error) {
      console.error('Erro ao carregar modelo:', error);
      toast({
        title: "Modelo Não Encontrado",
        description: "Treine o modelo na aba 'Treinamento' primeiro.",
        variant: "destructive"
      });
    }
  };

  const analyzeContent = async () => {
    if (!inputText.trim()) {
      toast({
        title: "Texto Obrigatório",
        description: "Por favor, insira uma letra de música para análise.",
        variant: "destructive"
      });
      return;
    }

    if (!modelReady) {
      toast({
        title: "Modelo Não Disponível",
        description: "O modelo CNN ainda não foi treinado ou carregado.",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    setResult(null);

    try {
      console.log('Analisando texto com CNN local...');
      const prediction = await cnnModel.predict(inputText);
      
      setResult(prediction);
      
      toast({
        title: "Análise Concluída",
        description: `Nível detectado: ${prediction.category.toUpperCase()} (${(prediction.score * 100).toFixed(1)}%)`,
      });
      
    } catch (error) {
      console.error('Erro na análise:', error);
      toast({
        title: "Erro na Análise",
        description: "Ocorreu um erro ao analisar o conteúdo.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSeverityColor = (category: string) => {
    switch (category) {
      case 'baixo': return 'bg-green-100 text-green-800 border-green-200';
      case 'medio': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'alto': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityIcon = (category: string) => {
    switch (category) {
      case 'baixo': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'medio': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'alto': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Music className="h-4 w-4 text-gray-600" />;
    }
  };

  const exampleTexts = [
    {
      title: "Exemplo - Conteúdo Neutro",
      text: "Dancing through the night, feeling so alive\nMusic in my heart, love will never die\nTogether we can reach the stars above\nThis is a song about hope and love"
    },
    {
      title: "Exemplo - Conteúdo Questionável",
      text: "She's just a toy for me to play\nGotta keep her in her place\nWomen should know where they belong\nThis is how I like my song"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Classificador CNN - Detecção de Misoginia</h2>
        <p className="text-muted-foreground">
          Analise letras de música usando rede neural convolucional treinada localmente
        </p>
      </div>

      {/* Model Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Status do Modelo CNN
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${modelReady ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className={`font-medium ${modelReady ? 'text-green-700' : 'text-red-700'}`}>
                {modelReady ? 'Modelo Ativo' : 'Modelo Não Disponível'}
              </span>
            </div>
            {!modelReady && (
              <Button variant="outline" onClick={initializeModel}>
                Carregar Modelo
              </Button>
            )}
          </div>
          
          {modelInfo && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="font-medium">Parâmetros</div>
                <div>{modelInfo.totalParams?.toLocaleString()}</div>
              </div>
              <div>
                <div className="font-medium">Arquitetura</div>
                <div>{modelInfo.architecture}</div>
              </div>
              <div>
                <div className="font-medium">Vocabulário</div>
                <div>{modelInfo.vocabSize?.toLocaleString()}</div>
              </div>
              <div>
                <div className="font-medium">Execução</div>
                <div>100% Local</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analysis Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Entrada de Texto</CardTitle>
            <CardDescription>
              Cole ou digite a letra da música para análise
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Cole aqui a letra da música que deseja analisar..."
              rows={10}
              className="resize-none"
            />
            
            <Button 
              onClick={analyzeContent} 
              disabled={isAnalyzing || !modelReady}
              className="w-full"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analisando com CNN...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Analisar Conteúdo
                </>
              )}
            </Button>

            {/* Example buttons */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Exemplos para teste:</p>
              {exampleTexts.map((example, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setInputText(example.text)}
                  className="text-xs"
                >
                  {example.title}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resultado da Análise</CardTitle>
            <CardDescription>
              Classificação automática por rede neural
            </CardDescription>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    {getSeverityIcon(result.category)}
                    <Badge variant="outline" className={getSeverityColor(result.category)}>
                      Nível {result.category.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="text-3xl font-bold mb-1">
                    {(result.score * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Pontuação de misoginia
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Confiança</span>
                      <span>{(result.confidence * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={result.confidence * 100} />
                  </div>

                  <div className="p-4 border rounded-lg bg-muted">
                    <h4 className="font-medium mb-2">Interpretação:</h4>
                    <p className="text-sm">
                      {result.category === 'baixo' && 
                        'O conteúdo apresenta baixo ou nenhum indício de misoginia detectável pelo modelo.'}
                      {result.category === 'medio' && 
                        'O conteúdo apresenta elementos que podem ser considerados moderadamente misóginos.'}
                      {result.category === 'alto' && 
                        'O conteúdo apresenta fortes indícios de linguagem misógina ou objetificação.'}
                    </p>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    <p><strong>Método:</strong> CNN treinada localmente</p>
                    <p><strong>Execução:</strong> 100% local, sem conexão externa</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Music className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Insira uma letra de música e clique em "Analisar" para ver os resultados.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ContentClassifier;
