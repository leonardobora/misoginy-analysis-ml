
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Music, Database, Brain, AlertTriangle, CheckCircle } from 'lucide-react';
import { localDataService, SystemStats, RecentAnalysis } from '@/services/LocalDataService';

const DashboardOverview = () => {
  const [systemStats, setSystemStats] = useState<SystemStats>({
    totalSongs: 0,
    labeledSongs: 0,
    averageScore: 0,
    completionRate: 0,
    lastUpdate: new Date().toLocaleDateString('pt-BR')
  });
  
  const [recentAnalyses, setRecentAnalyses] = useState<RecentAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Carregar estatísticas do sistema usando LocalDataService
      const stats = await localDataService.getSystemStats();
      setSystemStats(stats);

      // Carregar análises recentes
      const recentData = await localDataService.getRecentAnalyses(5);
      setRecentAnalyses(recentData);

    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCategory = (score: number): string => {
    if (score <= 0.33) return 'Baixo';
    if (score <= 0.66) return 'Médio';
    return 'Alto';
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Baixo': return 'bg-green-100 text-green-800 border-green-200';
      case 'Médio': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Alto': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `há ${diffMins} min`;
    if (diffHours < 24) return `há ${diffHours}h`;
    return `há ${diffDays} dias`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando dados do sistema...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Dashboard do Sistema</h2>
        <p className="text-muted-foreground">
          Dados reais do sistema de classificação de misoginia em letras musicais
        </p>
      </div>

      {/* System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Músicas</CardTitle>
            <Music className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.totalSongs.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Dataset do Kaggle carregado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Músicas Rotuladas</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.labeledSongs}</div>
            <p className="text-xs text-muted-foreground">
              {systemStats.completionRate.toFixed(1)}% do total
            </p>
            <Progress value={systemStats.completionRate} className="mt-2 h-1" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Score Médio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(systemStats.averageScore * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Nível médio de misoginia
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sistema</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">Operacional</div>
            <p className="text-xs text-muted-foreground">
              Atualizado em {systemStats.lastUpdate}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Toward Goals */}
      <Card>
        <CardHeader>
          <CardTitle>Progresso do Projeto</CardTitle>
          <CardDescription>
            Acompanhe o progresso para atingir os requisitos do professor
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">
                  Rotulagem Manual (mínimo 30 músicas)
                </span>
                <span className="text-sm text-muted-foreground">
                  {systemStats.labeledSongs}/30
                </span>
              </div>
              <Progress 
                value={Math.min((systemStats.labeledSongs / 30) * 100, 100)} 
                className="h-2"
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">
                  Dataset Carregado (6292 músicas esperadas)
                </span>
                <span className="text-sm text-muted-foreground">
                  {systemStats.totalSongs}/6292
                </span>
              </div>
              <Progress 
                value={Math.min((systemStats.totalSongs / 6292) * 100, 100)} 
                className="h-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Analyses */}
      <Card>
        <CardHeader>
          <CardTitle>Rotulagens Recentes</CardTitle>
          <CardDescription>
            Últimas classificações manuais realizadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentAnalyses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma música foi rotulada ainda.</p>
              <p className="text-sm">Vá para a aba "Rotulagem" para começar a classificar músicas.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentAnalyses.map((analysis) => (
                <div key={analysis.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="font-medium">{analysis.title}</div>
                      <div className="text-sm text-muted-foreground">{analysis.artist}</div>
                    </div>
                    <Badge variant="outline" className={getCategoryColor(analysis.category)}>
                      {analysis.category} ({(analysis.score * 100).toFixed(0)}%)
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatTimeAgo(analysis.created_at)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardOverview;
