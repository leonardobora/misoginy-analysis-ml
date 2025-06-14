
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, AlertTriangle, XCircle, Database, Brain, Music, Tags, BarChart3 } from 'lucide-react';

interface FeatureStatus {
  name: string;
  description: string;
  status: 'implemented' | 'partial' | 'pending' | 'blocked';
  progress: number;
  icon: React.ElementType;
  details: string[];
}

const ImplementationStatus = () => {
  const features: FeatureStatus[] = [
    {
      name: 'Banco de Dados',
      description: 'Estrutura de dados no Supabase',
      status: 'implemented',
      progress: 100,
      icon: Database,
      details: [
        '✅ Tabela songs criada',
        '✅ Tabela labels criada',
        '✅ Conexão com Supabase estabelecida'
      ]
    },
    {
      name: 'Upload de Dados',
      description: 'Importação do dataset do Kaggle',
      status: 'implemented',
      progress: 100,
      icon: Music,
      details: [
        '✅ Interface de upload CSV',
        '✅ Validação de dados',
        '✅ Inserção no banco de dados'
      ]
    },
    {
      name: 'Rotulagem Manual',
      description: 'Sistema de classificação manual',
      status: 'implemented',
      progress: 100,
      icon: Tags,
      details: [
        '✅ Interface de rotulagem',
        '✅ Classificação baixo/médio/alto',
        '✅ Importação de JSON existente',
        '✅ Persistência no banco'
      ]
    },
    {
      name: 'Classificador CNN',
      description: 'Modelo de rede neural para detecção',
      status: 'partial',
      progress: 30,
      icon: Brain,
      details: [
        '⚠️ Interface de simulação criada',
        '❌ Modelo CNN real não implementado',
        '❌ Treinamento com dados reais',
        '❌ API para inferência'
      ]
    },
    {
      name: 'Dashboard e Métricas',
      description: 'Visualização de resultados e estatísticas',
      status: 'partial',
      progress: 60,
      icon: BarChart3,
      details: [
        '✅ Dashboard básico criado',
        '⚠️ Dados mockados',
        '❌ Métricas reais do modelo',
        '❌ Gráficos de performance'
      ]
    }
  ];

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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Status da Implementação</h2>
        <p className="text-muted-foreground">
          Acompanhe o progresso do desenvolvimento do sistema de classificação
        </p>
      </div>

      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Progresso Geral
          </CardTitle>
          <CardDescription>
            Status consolidado de todas as funcionalidades
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
                  <h4 className="font-medium text-sm">Detalhes:</h4>
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
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Próximos Passos Recomendados
          </CardTitle>
          <CardDescription>
            Ações necessárias para completar a implementação
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium">1</div>
              <div>
                <div className="font-medium">Upload do Dataset</div>
                <div className="text-sm text-muted-foreground">Faça upload do dataset do Kaggle na aba "Dados"</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium">2</div>
              <div>
                <div className="font-medium">Importar Labels Existentes</div>
                <div className="text-sm text-muted-foreground">Use a função de importação JSON na aba "Rotulagem"</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium">3</div>
              <div>
                <div className="font-medium">Completar Rotulagem Manual</div>
                <div className="text-sm text-muted-foreground">Classifique pelo menos 30 músicas manualmente</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-sm font-medium">4</div>
              <div>
                <div className="font-medium">Implementar Modelo CNN Real</div>
                <div className="text-sm text-muted-foreground">Substituir simulação por modelo de ML real</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-sm font-medium">5</div>
              <div>
                <div className="font-medium">Conectar Dashboard com Dados Reais</div>
                <div className="text-sm text-muted-foreground">Integrar métricas reais do modelo e banco de dados</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImplementationStatus;
