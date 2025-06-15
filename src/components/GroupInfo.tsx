
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, GraduationCap, BookOpen, Calendar, MapPin } from 'lucide-react';

const GroupInfo = () => {
  const members = [
    {
      name: "Leonardo Bora",
      role: "Desenvolvedor Full-Stack",
      responsibilities: "Arquitetura do sistema, modelagem CNN"
    },
    {
      name: "Letícia Campos", 
      role: "Especialista em ML",
      responsibilities: "Treinamento de modelos, análise de dados"
    },
    {
      name: "Carlos Krueger",
      role: "Desenvolvedor Frontend",
      responsibilities: "Interface do usuário, visualizações"
    },
    {
      name: "Nathan",
      role: "Desenvolvedor Backend",
      responsibilities: "APIs, integração de dados"
    },
    {
      name: "Luan Constâncio",
      role: "Analista de Dados",
      responsibilities: "Rotulagem manual, pré-processamento"
    }
  ];

  const projectInfo = {
    course: "Engenharia de Software",
    period: "7º Período",
    class: "Turma B",
    subject: "Aprendizado de Máquina",
    professor: "Prof. Mozart Hasse",
    title: "ADS2 - Detecção de Conteúdo Misógino em Letras Musicais",
    year: "2024"
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Informações do Grupo</h2>
        <p className="text-muted-foreground">
          Atividade Discente Supervisionada 2 - Sistema de Classificação Musical
        </p>
      </div>

      {/* Project Info Card */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            Informações do Projeto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Dados Acadêmicos</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    <span>{projectInfo.course}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{projectInfo.period} - {projectInfo.class}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{projectInfo.subject}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Professor</h4>
                <p className="text-sm">{projectInfo.professor}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Título do Projeto</h4>
                <p className="text-sm font-medium bg-muted p-3 rounded-lg">
                  {projectInfo.title}
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Tecnologias</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">React + TypeScript</Badge>
                  <Badge variant="secondary">TensorFlow.js</Badge>
                  <Badge variant="secondary">CNN</Badge>
                  <Badge variant="secondary">Supabase</Badge>
                  <Badge variant="secondary">Tailwind CSS</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Members */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-6 w-6" />
            Membros do Grupo
          </CardTitle>
          <CardDescription>
            Equipe responsável pelo desenvolvimento do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map((member, index) => (
              <Card key={index} className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{member.name}</CardTitle>
                  <Badge variant="outline" className="w-fit">
                    {member.role}
                  </Badge>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground">
                    {member.responsibilities}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Project Methodology */}
      <Card>
        <CardHeader>
          <CardTitle>Metodologia Aplicada</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Abordagem Técnica</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <span>Rede Neural Convolucional (CNN) para classificação de texto</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <span>Processamento de linguagem natural com TensorFlow.js</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <span>Execução 100% local sem dependências externas</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <span>Interface web responsiva com React</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Processo de Desenvolvimento</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <span>Análise exploratória do dataset (Top 100 Songs 1959-2023)</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <span>Rotulagem manual de 30+ músicas com critérios definidos</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <span>Treinamento de modelo CNN personalizado</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <span>Validação e teste com métricas de performance</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Academic Requirements */}
      <Card className="bg-muted">
        <CardHeader>
          <CardTitle>Requisitos Acadêmicos Atendidos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2 text-green-700">✓ Implementados</h4>
              <ul className="space-y-1 text-sm">
                <li>• Algoritmo de redes neurais (CNN)</li>
                <li>• Execução 100% local</li>
                <li>• Análise exploratória dos dados</li>
                <li>• Rotulagem manual (30+ músicas)</li>
                <li>• Interface web funcional</li>
                <li>• Pontuação contínua (0-1)</li>
                <li>• Visualizações e métricas</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-blue-700">📝 Documentação</h4>
              <ul className="space-y-1 text-sm">
                <li>• Relatório técnico detalhado</li>
                <li>• Justificativas metodológicas</li>
                <li>• Análise de limitações éticas</li>
                <li>• Ranking de músicas classificadas</li>
                <li>• Código documentado e organizado</li>
                <li>• Referências ABNT</li>
                <li>• Apresentação final</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GroupInfo;
