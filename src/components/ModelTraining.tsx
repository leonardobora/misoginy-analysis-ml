
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Brain, Play, Square, Settings, TrendingUp, Clock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const ModelTraining = () => {
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [currentEpoch, setCurrentEpoch] = useState(0);

  const models = [
    {
      id: 1,
      name: "CNN Multi-label v2.1",
      accuracy: 87.5,
      status: "Ativo",
      lastTrained: "14 Jun 2025",
      epochs: 50,
      parameters: "2.3M"
    },
    {
      id: 2,
      name: "CNN Multi-label v2.0",
      accuracy: 84.2,
      status: "Arquivado",
      lastTrained: "10 Jun 2025",
      epochs: 45,
      parameters: "2.1M"
    },
    {
      id: 3,
      name: "CNN Multi-label v1.9",
      accuracy: 81.7,
      status: "Arquivado",
      lastTrained: "05 Jun 2025",
      epochs: 40,
      parameters: "1.8M"
    }
  ];

  const trainingConfig = {
    epochs: 50,
    batchSize: 32,
    learningRate: 0.001,
    optimizer: "Adam",
    architecture: "CNN Multi-label"
  };

  const handleStartTraining = async () => {
    setIsTraining(true);
    setTrainingProgress(0);
    setCurrentEpoch(0);

    toast({
      title: "Treinamento Iniciado",
      description: "O modelo está sendo treinado com os parâmetros configurados.",
    });

    // Simulate training progress
    const interval = setInterval(() => {
      setTrainingProgress(prev => {
        const newProgress = prev + 2;
        setCurrentEpoch(Math.floor((newProgress / 100) * trainingConfig.epochs));
        
        if (newProgress >= 100) {
          clearInterval(interval);
          setIsTraining(false);
          toast({
            title: "Treinamento Concluído",
            description: "Novo modelo treinado com sucesso. Precisão: 88.3%",
          });
          return 100;
        }
        return newProgress;
      });
    }, 300);
  };

  const handleStopTraining = () => {
    setIsTraining(false);
    setTrainingProgress(0);
    setCurrentEpoch(0);
    
    toast({
      title: "Treinamento Interrompido",
      description: "O processo de treinamento foi cancelado.",
      variant: "destructive",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ativo': return 'bg-green-100 text-green-800 border-green-200';
      case 'Treinando': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Arquivado': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Treinamento de Modelos</h2>
        <p className="text-muted-foreground">
          Configure e execute o treinamento de modelos CNN para classificação
        </p>
      </div>

      {/* Training Control */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Controle de Treinamento
          </CardTitle>
          <CardDescription>
            Inicie, pare ou configure o treinamento do modelo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Configuration */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Épocas</label>
              <div className="p-2 border rounded text-sm">{trainingConfig.epochs}</div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Batch Size</label>
              <div className="p-2 border rounded text-sm">{trainingConfig.batchSize}</div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Learning Rate</label>
              <div className="p-2 border rounded text-sm">{trainingConfig.learningRate}</div>
            </div>
          </div>

          {/* Training Progress */}
          {isTraining && (
            <div className="space-y-4 p-4 border rounded-lg bg-blue-50">
              <div className="flex items-center justify-between">
                <span className="font-medium">Treinamento em Progresso</span>
                <span className="text-sm text-muted-foreground">
                  Época {currentEpoch}/{trainingConfig.epochs}
                </span>
              </div>
              <Progress value={trainingProgress} className="h-3" />
              <div className="text-sm text-muted-foreground">
                {trainingProgress.toFixed(1)}% concluído
              </div>
            </div>
          )}

          {/* Control Buttons */}
          <div className="flex gap-3">
            {!isTraining ? (
              <>
                <Button onClick={handleStartTraining} className="flex items-center gap-2">
                  <Play className="h-4 w-4" />
                  Iniciar Treinamento
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Configurar
                </Button>
              </>
            ) : (
              <Button 
                variant="destructive" 
                onClick={handleStopTraining}
                className="flex items-center gap-2"
              >
                <Square className="h-4 w-4" />
                Parar Treinamento
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Models History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Histórico de Modelos
          </CardTitle>
          <CardDescription>
            Visualize e compare diferentes versões dos modelos treinados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {models.map((model) => (
              <div key={model.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <Brain className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{model.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {model.parameters} parâmetros • {model.epochs} épocas
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-medium">{model.accuracy}%</div>
                    <div className="text-sm text-muted-foreground">Precisão</div>
                  </div>
                  <Badge variant="outline" className={getStatusColor(model.status)}>
                    {model.status}
                  </Badge>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {model.lastTrained}
                  </div>
                  <Button variant="outline" size="sm">
                    Detalhes
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ModelTraining;
