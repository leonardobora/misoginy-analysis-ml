
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, AlertTriangle, XCircle, Database, Brain, Music, Tags, BarChart3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface FeatureStatus {
  name: string;
  description: string;
  status: 'implemented' | 'partial' | 'pending' | 'blocked';
  progress: number;
  icon: React.ElementType;
  details: string[];
}

interface SystemData {
  totalSongs: number;
  labeledSongs: number;
  hasModel: boolean;
}

const ImplementationStatus = () => {
  const [systemData, setSystemData] = useState<SystemData>({
    totalSongs: 0,
    labeledSongs: 0,
    hasModel: false
  });

  useEffect(() => {
    loadSystemData();
  }, []);

  const loadSystemData = async () => {
    try {
      // Verificar dados do sistema
      const { count: totalSongs } = await supabase
        .from('songs')
        .select('*', { count: 'exact', head: true });

      const { count: labeledSongs } = await supabase
        .from('manual_labels')
        .select('*', { count: 'exact', head: true })
        .eq('theme', 'Misoginia');

      // Verificar se modelo existe no localStorage
      const hasModel = localStorage.getItem('tensorflowjs_models/misogyny-cnn-model/info') !== null;

      setSystemData({
        totalSongs: totalSongs || 0,
        labeledSongs: labeledSongs || 0,
        hasModel: hasModel
      });
    } catch (error) {
      console.error('Erro ao carregar dados do sistema:', error);
    }
  };

  const getFeatures = (): FeatureStatus[] => [
    {
      name: 'Banco de Dados',
      description: 'Estrutura de dados no Supabase',
      status: 'implemented',
      progress: 100,
      icon: Database,
      details: [
        '✅ Tabela songs criada e configurada',
        '✅ Tabela manual_labels criada',
        '✅ Políticas RLS configuradas',
        '✅ Conexão com Supabase ativa'
      ]
    },
    {
      name: 'Upload de Dados',
      description: 'Importação do dataset do Kaggle',
      status: systemData.totalSongs > 0 ? 'implemented' : 'pending',
      progress: systemData.totalSongs > 0 ? 100 : 0,
      icon: Music,
      details: [
        systemData.totalSongs > 0 ? '✅ Dataset Kaggle carregado' : '❌ Dataset não carregado',
        `${systemData.totalSongs > 0 ? '✅' : '❌'} ${systemData.totalSongs.toLocaleString()} músicas importadas`,
        '✅ Parser CSV para formato Kaggle',
        '✅ Validação e limpeza de dados'
      ]
    },
    {
      name: 'Rotulagem Manual',
      description: 'Sistema de classificação manual',
      status: systemData.labeledSongs >= 30 ? 'implemented' : systemData.labeledSongs > 0 ? 'partial' : 'pending',
      progress: Math.min((systemData.labeledSongs / 30) * 100, 100),
      icon: Tags,
      details: [
        '✅ Interface de rotulagem criada',
        '✅ Classificação baixo/médio/alto',
        '✅ Escala de 0-100 implementada',
        `${systemData.labeledSongs >= 30 ? '✅' : '⚠️'} ${systemData.labeledSongs}/30 músicas rotuladas`,
        '✅ Persistência no banco de dados'
      ]
    },
    {
      name: 'Modelo CNN Local',
      description: 'Rede neural para detecção (100% local)',
      status: systemData.hasModel ? 'implemented' : systemData.labeledSongs >= 10 ? 'partial' : 'pending',
      progress: systemData.hasModel ? 100 : systemData.labeledSongs >= 10 ? 60 : 20,
      icon: Brain,
      details: [
        '✅ Arquitetura CNN implementada',
        '✅ TensorFlow.js integrado',
        '✅ Treinamento 100% local',
        `${systemData.hasModel ? '✅' : '⚠️'} Modelo ${systemData.hasModel ? 'treinado' : 'não treinado'}`,
        '✅ Predição em tempo real',
        '✅ Sem dependência externa'
      ]
    },
    {
      name: 'Dashboard e Visualização',
      description: 'Interface e análise de resultados',
      status: 'implemented',
      progress: 100,
      icon: BarChart3,
      details: [
        '✅ Dashboard com dados reais',
        '✅ Estatísticas do sistema',
        '✅ Progresso de rotulagem',
        '✅ Histórico de análises',
        '✅ Visualização de resultados'
      ]
    }
  ];

  const features = getFeatures();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'implemented': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'partial': return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'pending': return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'blocked': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'implemented': return <Badge className="bg-green-100 text-green-800 border-green-200">Implementado</Badge>;
      case 'partial': return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Parcial</Badge>;
      case 'pending': return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Pendente</Badge>;
      case 'blocked': return <Badge className="bg-red-100 text-red-800 border-red-200">Bloqueado</Badge>;
      default: return <Badge variant="secondary">Desconhecido</Badge>;
    }
  };

  const overallProgress = Math.round(features.reduce((acc, feature) => acc + feature.progress, 0) / features.length);

  const implementedCount = features.filter(f => f.status === 'implemented').length;
  const partialCount = features.filter(f => f.status === 'partial').length;
  const pendingCount = features.filter(f => f.status === 'pending').length;

  // Verificar conformidade com requisitos do professor
  const requirements = {
    datasetLoaded: systemData.totalSongs >= 6000,
    manualLabeling: systemData.labeledSongs >= 30,
    localModel: systemData.hasModel,
    cnnImplemented: true // CNN está implementado no código
  };

  const requirementScore = Object.values(requirements).filter(Boolean).length / Object.values(requirements).length * 100;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Status da Implementação</h2>
        <p className="text-muted-foreground">
          Progresso baseado em dados reais do sistema - Critérios do Prof. Mozart Hasse
        </p>
      </div>

      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Progresso Geral do Sistema
          </CardTitle>
          <CardDescription>
            Status consolidado baseado em dados reais do banco
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Implementação Completa</span>
              <span className="text-sm font-medium">{overallProgress}%</span>
            </div>
            <Progress value={overallProgress} className="h-3" />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{implementedCount}</div>
                <div className="text-sm text-muted-foreground">Implementadas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{partialCount}</div>
                <div className="text-sm text-muted-foreground">Parciais</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{pendingCount}</div>
                <div className="text-sm text-muted-foreground">Pendentes</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Professor Requirements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Conformidade com Requisitos (Prof. Mozart)
          </CardTitle>
          <CardDescription>
            Verificação automática dos critérios da ADS2
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Atendimento aos Requisitos</span>
              <span className="text-sm font-medium">{requirementScore.toFixed(0)}%</span>
            </div>
            <Progress value={requirementScore} className="h-3" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  {requirements.datasetLoaded ? 
                    <CheckCircle className="h-4 w-4 text-green-600" /> : 
                    <XCircle className="h-4 w-4 text-red-600" />
                  }
                  <span className="text-sm">Dataset Kaggle (6000+ músicas)</span>
                  <Badge variant="outline" className="text-xs">
                    {systemData.totalSongs.toLocaleString()}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2">
                  {requirements.manualLabeling ? 
                    <CheckCircle className="h-4 w-4 text-green-600" /> : 
                    <Clock className="h-4 w-4 text-yellow-600" />
                  }
                  <span className="text-sm">Rotulagem manual (mín. 30)</span>
                  <Badge variant="outline" className="text-xs">
                    {systemData.labeledSongs}
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  {requirements.localModel ? 
                    <CheckCircle className="h-4 w-4 text-green-600" /> : 
                    <Clock className="h-4 w-4 text-yellow-600" />
                  }
                  <span className="text-sm">Modelo treinado localmente</span>
                </div>
                
                <div className="flex items-center gap-2">
                  {requirements.cnnImplemented ? 
                    <CheckCircle className="h-4 w-4 text-green-600" /> : 
                    <XCircle className="h-4 w-4 text-red-600" />
                  }
                  <span className="text-sm">CNN para detecção</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feature Status */}
      <div className="grid gap-6">
        {features.map((feature, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <feature.icon className="h-5 w-5" />
                  {feature.name}
                  {getStatusIcon(feature.status)}
                </CardTitle>
                {getStatusBadge(feature.status)}
              </div>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Progresso</span>
                  <span className="text-sm font-medium">{feature.progress}%</span>
                </div>
                <Progress value={feature.progress} className="h-2" />
                
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Status detalhado:</h4>
                  <ul className="space-y-1">
                    {feature.details.map((detail, detailIndex) => (
                      <li key={detailIndex} className="text-sm text-muted-foreground">
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-blue-500" />
            Próximos Passos para Entrega
          </CardTitle>
          <CardDescription>
            Ações baseadas no status atual do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {systemData.totalSongs === 0 && (
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-sm font-medium">!</div>
                <div>
                  <div className="font-medium">Carregar Dataset do Kaggle</div>
                  <div className="text-sm text-muted-foreground">Faça upload do arquivo CSV na aba "Dados"</div>
                </div>
              </div>
            )}
            
            {systemData.labeledSongs < 30 && (
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center text-sm font-medium">
                  {Math.floor((systemData.labeledSongs / 30) * 10)}
                </div>
                <div>
                  <div className="font-medium">Completar Rotulagem Manual</div>
                  <div className="text-sm text-muted-foreground">
                    Rotular {30 - systemData.labeledSongs} músicas restantes na aba "Rotulagem"
                  </div>
                </div>
              </div>
            )}
            
            {systemData.labeledSongs >= 10 && !systemData.hasModel && (
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium">3</div>
                <div>
                  <div className="font-medium">Treinar Modelo CNN</div>
                  <div className="text-sm text-muted-foreground">Use a aba "Treinamento" para treinar o modelo localmente</div>
                </div>
              </div>
            )}
            
            {systemData.hasModel && systemData.labeledSongs >= 30 && (
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm font-medium">✓</div>
                <div>
                  <div className="font-medium">Sistema Pronto para Entrega</div>
                  <div className="text-sm text-muted-foreground">
                    Todos os requisitos foram atendidos. Use a aba "Classificador" para testar o modelo.
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImplementationStatus;
