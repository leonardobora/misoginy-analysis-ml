
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, Database, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const DataUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const datasets = [
    { 
      id: 1, 
      name: "Dataset Principal", 
      size: "2.3 MB", 
      songs: 1247, 
      status: "Ativo",
      lastUpdate: "14 Jun 2025"
    },
    { 
      id: 2, 
      name: "Dados de Validação", 
      size: "890 KB", 
      songs: 312, 
      status: "Ativo",
      lastUpdate: "12 Jun 2025"
    },
    { 
      id: 3, 
      name: "Conjunto de Teste", 
      size: "1.1 MB", 
      songs: 456, 
      status: "Processando",
      lastUpdate: "14 Jun 2025"
    }
  ];

  const handleUpload = async () => {
    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          toast({
            title: "Upload Concluído",
            description: "Dataset carregado e processado com sucesso.",
          });
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ativo': return 'bg-green-100 text-green-800 border-green-200';
      case 'Processando': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Erro': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Ativo': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'Processando': return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'Erro': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Gerenciamento de Dados</h2>
        <p className="text-muted-foreground">
          Faça upload e gerencie datasets para treinamento e validação
        </p>
      </div>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload de Dataset
          </CardTitle>
          <CardDescription>
            Envie arquivos CSV com letras de música e rótulos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium mb-2">Arraste arquivos aqui ou clique para selecionar</p>
            <p className="text-sm text-muted-foreground mb-4">
              Suporta arquivos CSV com colunas: letra, categoria, confiança
            </p>
            <Button onClick={handleUpload} disabled={isUploading}>
              {isUploading ? 'Fazendo Upload...' : 'Selecionar Arquivos'}
            </Button>
          </div>

          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progresso do upload</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Datasets List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Datasets Disponíveis
          </CardTitle>
          <CardDescription>
            Visualize e gerencie seus datasets de treinamento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {datasets.map((dataset) => (
              <div key={dataset.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  {getStatusIcon(dataset.status)}
                  <div>
                    <div className="font-medium">{dataset.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {dataset.songs} músicas • {dataset.size}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className={getStatusColor(dataset.status)}>
                    {dataset.status}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {dataset.lastUpdate}
                  </span>
                  <Button variant="outline" size="sm">
                    Visualizar
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

export default DataUpload;
