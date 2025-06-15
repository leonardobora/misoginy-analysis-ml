import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Music, Database, Brain, BarChart3, Tags, Users, Activity } from 'lucide-react';
import ContentClassifier from '@/components/ContentClassifier';
import DashboardOverview from '@/components/DashboardOverview';
import DataUpload from '@/components/DataUpload';
import ModelTraining from '@/components/ModelTraining';
import ManualLabeling from '@/components/ManualLabeling';
import ImplementationStatus from '@/components/ImplementationStatus';
import GroupInfo from '@/components/GroupInfo';
const Index = () => {
  return <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <Music className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Sistema de Classificação Musical</h1>
              <p className="text-muted-foreground">
                Detecção de conteúdo sensível em letras de música usando CNNs
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 flex-1">
        <Tabs defaultValue="grupo" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="grupo" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Grupo
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="classifier" className="flex items-center gap-2">
              <Music className="h-4 w-4" />
              Classificador
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Dados
            </TabsTrigger>
            <TabsTrigger value="labeling" className="flex items-center gap-2">
              <Tags className="h-4 w-4" />
              Rotulagem
            </TabsTrigger>
            <TabsTrigger value="training" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Treinamento
            </TabsTrigger>
          </TabsList>

          <TabsContent value="grupo">
            <GroupInfo />
          </TabsContent>

          <TabsContent value="dashboard">
            <DashboardOverview />
          </TabsContent>

          <TabsContent value="classifier">
            <ContentClassifier />
          </TabsContent>

          <TabsContent value="data">
            <DataUpload />
          </TabsContent>

          <TabsContent value="labeling">
            <ManualLabeling />
          </TabsContent>

          <TabsContent value="training">
            <ModelTraining />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">© 2025 UniBrasil Centro Universitário - Engenharia de Software</div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Status do Projeto
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <ImplementationStatus />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </footer>
    </div>;
};
export default Index;