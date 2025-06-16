# Manual do Usuário - Sistema de Classificação Musical

**Versão 1.0 - Junho 2025**

**Instituição:** UniBrasil Centro Universitário  
**Projeto:** ADS2 - Aprendizado de Máquina

---

## 1. Introdução

Bem-vindo ao Sistema de Classificação Musical. Esta ferramenta foi desenvolvida como parte da disciplina de Aprendizado de Máquina para detectar conteúdo misógino em letras de música, utilizando uma Rede Neural Convolucional (CNN) que opera **100% localmente** no seu navegador.

Este manual guiará você por todas as funcionalidades do sistema, desde a análise inicial dos dados até o treinamento e uso do modelo de IA.

## 2. Arquitetura 100% Local

O principal diferencial deste sistema é sua capacidade de funcionar de forma totalmente offline. Isso é possível graças a duas tecnologias principais:

-   **IndexedDB:** Um banco de dados interno do navegador onde todo o dataset de músicas, seus rótulos e os modelos de IA treinados são armazenados de forma segura e persistente.
-   **TensorFlow.js:** Uma biblioteca que permite treinar e executar modelos de Machine Learning diretamente no seu navegador, sem a necessidade de um servidor externo.

## 3. Acessando o Sistema

### 3.1 Via Web (Lovable)
- Acesse: [URL do sistema quando publicado]
- Interface responsiva funciona em desktop e mobile

### 3.2 Instalação Local
```bash
git clone [URL_DO_REPOSITORIO]
cd sistema-classificacao-musical
npm install
npm run dev
```

## 4. Funcionalidades do Sistema

### 4.1 Aba "Grupo"
- **Finalidade:** Apresentar informações da equipe acadêmica
- **Conteúdo:** Dados dos integrantes, curso, disciplina
- **Uso:** Apenas informativo

### 4.2 Aba "Status"  
- **Finalidade:** Visualizar progresso de implementação
- **Indicadores:**
  - ✅ Funcionalidades implementadas
  - 🔄 Em desenvolvimento
  - ❌ Pendentes
- **Métricas:** Contadores de dados, modelos, análises

### 4.3 Aba "Dashboard"
- **Finalidade:** Análise exploratória dos dados
- **Visualizações:**
  - Distribuição temporal das músicas (1959-2023)
  - Top artistas por década
  - Análise de frequência de palavras
  - Estatísticas do dataset

### 4.4 Aba "Classificador"
- **Finalidade:** Classificação em tempo real de letras
- **Como usar:**
  1. Cole a letra da música no campo de texto
  2. Clique em "Analisar Conteúdo"
  3. Visualize a pontuação (0-1) e análise detalhada
- **Resultados:**
  - Score numérico de misoginia
  - Nível de confiança
  - Palavras-chave identificadas
  - Justificativa da classificação

### 4.5 Aba "Dados"
- **Finalidade:** Gerenciamento do dataset
- **Funcionalidades:**
  - Upload de arquivos CSV
  - Visualização de amostras
  - Estatísticas do dataset
  - Validação de dados
- **Formatos aceitos:** CSV com colunas: year, artist, title, lyrics

### 4.6 Aba "Rotulagem"
- **Finalidade:** Classificação manual para treinamento
- **Processo:**
  1. Selecione filtros (período, artista, etc.)
  2. Analise a letra apresentada
  3. Atribua nível de misoginia:
     - **Baixo (0-33):** Pouco ou nenhum conteúdo misógino
     - **Médio (34-66):** Presença moderada
     - **Alto (67-100):** Conteúdo claramente misógino
  4. Ajuste pontuação precisa com slider
  5. Adicione justificativa detalhada
  6. Salve o rótulo

**Dicas para Rotulagem:**
- Priorize músicas recentes (2010+) - maior potencial misógino
- Analise objetificação, linguagem depreciativa, violência
- Considere contexto cultural e artístico
- Seja consistente nos critérios

### 4.7 Aba "Treinamento"
- **Finalidade:** Treinar modelo CNN com dados rotulados
- **Pré-requisitos:** Mínimo 10 músicas rotuladas (ideal: 20+)
- **Processo:**
  1. Verifique status dos dados
  2. Configure parâmetros (automático)
  3. Clique "Treinar Modelo Ultra-Compacto"
  4. Monitore progresso em tempo real
  5. Visualize métricas finais

**Configurações da CNN:**
- Épocas: 15
- Batch Size: 4
- Learning Rate: 0.001
- Arquitetura: CNN Ultra-Compacto

## 5. Interpretação dos Resultados

### 5.1 Escala de Pontuação
- **0.0 - 0.3:** Conteúdo com baixa ou nenhuma misoginia
- **0.3 - 0.7:** Presença moderada de elementos misóginos  
- **0.7 - 1.0:** Conteúdo claramente misógino ou objetificação explícita

### 5.2 Métricas do Modelo
- **Acurácia:** Porcentagem de classificações corretas
- **Loss:** Erro do modelo (menor = melhor)
- **Épocas:** Ciclos de treinamento completados

### 5.3 Limitações
- Modelo não interpreta ironia ou contexto complexo
- Focado apenas em letras em inglês
- Subjetividade inerente ao conceito de misoginia
- Dataset limitado pode afetar performance

## 6. Solução de Problemas

### 6.1 Erro de Dados Insuficientes
- **Problema:** Menos de 10 músicas rotuladas
- **Solução:** Rotule mais músicas na aba "Rotulagem"

### 6.2 Erro de Treinamento
- **Problema:** Falha durante treinamento da CNN
- **Solução:** 
  - Verifique balanceamento do dataset
  - Reduza complexidade se necessário
  - Reinicie o navegador

### 6.3 Problema de Performance
- **Problema:** Sistema lento
- **Solução:**
  - Use navegador atualizado (Chrome/Firefox)
  - Feche abas desnecessárias
  - Modelo roda 100% no navegador

## 7. Requisitos Técnicos

### 7.1 Navegador
- Chrome 90+ (recomendado)
- Firefox 88+
- Safari 14+
- Edge 90+

### 7.2 Hardware Mínimo
- RAM: 4GB
- Processador: Dual-core 2GHz
- Conexão com internet

### 7.3 Para Desenvolvimento Local
- Node.js 18+
- npm ou yarn
- Git

## 8. Contato e Suporte

Para questões acadêmicas ou técnicas, entre em contato com a equipe:

- **Leonardo Bora** - Arquitetura e Machine Learning
- **Letícia Campos** - Especialista em ML e Análise
- **Carlos Krueger** - Desenvolvimento Frontend  
- **Nathan** - Análise de Dados e Rotulagem
- **Luan Constâncio** - Desenvolvimento Back-End

---

**Versão:** 1.0  
**Data:** Junho 2025  
**Disciplina:** Aprendizado de Máquina - Prof. Mozart Hasse
