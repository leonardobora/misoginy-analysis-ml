
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Music, Database, Brain, AlertTriangle, CheckCircle } from 'lucide-react';

const DashboardOverview = () => {
  const systemStats = {
    totalAnalyzed: 1247,
    accuracyRate: 87.5,
    modelVersion: "v2.1.0",
    lastUpdate: "14 Jun 2025"
  };

  const recentAnalyses = [
    { id: 1, title: "Análise #1247", category: "Conteúdo Limpo", confidence: 94, time: "há 2 min" },
    { id: 2, title: "Análise #1246", category: "Violência", confidence: 78, time: "há 5 min" },
    { id: 3, title: "Análise #1245", category: "Depressão", confidence: 85, time: "há 8 min" },
    { id: 4, title: "Análise #1244", category: "Conteúdo Limpo", confidence: 92, time: "há 12 min" },
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Conteúdo Limpo': return 'bg-green-100 text-green-800 border-green-200';
      case 'Violência': return 'bg-red-100 text-red-800 border-red-200';
      case 'Depressão': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Dashboard do Sistema</h2>
        <p className="text-muted-foreground">
          Visão geral do sistema de classificação de conteúdo musical
        </p>
      </div>

      {/* System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Análises Realizadas</CardTitle>
            <Music className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.totalAnalyzed.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+23</span> hoje
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Precisão</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.accuracyRate}%</div>
            <Progress value={systemStats.accuracyRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Versão do Modelo</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.modelVersion}</div>
            <p className="text-xs text-muted-foreground">
              CNN Multi-label
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Última Atualização</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{systemStats.lastUpdate}</div>
            <p className="text-xs text-muted-foreground">
              Sistema operacional
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Analyses */}
      <Card>
        <CardHeader>
          <CardTitle>Análises Recentes</CardTitle>
          <CardDescription>
            Últimas classificações realizadas pelo sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentAnalyses.map((analysis) => (
              <div key={analysis.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="font-medium">{analysis.title}</div>
                  <Badge variant="outline" className={getCategoryColor(analysis.category)}>
                    {analysis.category}
                  </Badge>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">
                    Confiança: {analysis.confidence}%
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {analysis.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardOverview;
