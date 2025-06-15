
# Manual do Usuário - Sistema de Classificação Musical

## Sistema de Detecção de Conteúdo Misógino em Letras de Música

**Universidade:** UFPR  
**Curso:** Engenharia de Software - 7º Período - Turma B  
**Disciplina:** Aprendizado de Máquina  
**Professor:** Mozart Hasse  

**Equipe:**
- Leonardo Bora
- Letícia Campos  
- Carlos Krueger
- Nathan
- Luan Constâncio

---

## 1. Introdução

Este sistema utiliza **Redes Neurais Convolucionais (CNN)** para detectar e classificar conteúdo misógino em letras de música do dataset "Top 100 Songs & Lyrics By Year (1959–2023)". O sistema atribui uma pontuação contínua de 0 a 1, onde 0 indica ausência de conteúdo misógino e 1 indica conteúdo flagrantemente misógino.

## 2. Acessando o Sistema

### 2.1 Via Web (Lovable)
- Acesse: [URL do sistema quando publicado]
- Interface responsiva funciona em desktop e mobile

### 2.2 Instalação Local
```bash
git clone [URL_DO_REPOSITORIO]
cd sistema-classificacao-musical
npm install
npm run dev
```

## 3. Funcionalidades do Sistema

### 3.1 Aba "Grupo"
- **Finalidade:** Apresentar informações da equipe acadêmica
- **Conteúdo:** Dados dos integrantes, curso, disciplina
- **Uso:** Apenas informativo

### 3.2 Aba "Status"  
- **Finalidade:** Visualizar progresso de implementação
- **Indicadores:**
  - ✅ Funcionalidades implementadas
  - 🔄 Em desenvolvimento
  - ❌ Pendentes
- **Métricas:** Contadores de dados, modelos, análises

### 3.3 Aba "Dashboard"
- **Finalidade:** Análise exploratória dos dados
- **Visualizações:**
  - Distribuição temporal das músicas (1959-2023)
  - Top artistas por década
  - Análise de frequência de palavras
  - Estatísticas do dataset

### 3.4 Aba "Classificador"
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

### 3.5 Aba "Dados"
- **Finalidade:** Gerenciamento do dataset
- **Funcionalidades:**
  - Upload de arquivos CSV
  - Visualização de amostras
  - Estatísticas do dataset
  - Validação de dados
- **Formatos aceitos:** CSV com colunas: year, artist, title, lyrics

### 3.6 Aba "Rotulagem"
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

### 3.7 Aba "Treinamento"
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

## 4. Interpretação dos Resultados

### 4.1 Escala de Pontuação
- **0.0 - 0.3:** Conteúdo com baixa ou nenhuma misoginia
- **0.3 - 0.7:** Presença moderada de elementos misóginos  
- **0.7 - 1.0:** Conteúdo claramente misógino ou objetificação explícita

### 4.2 Métricas do Modelo
- **Acurácia:** Porcentagem de classificações corretas
- **Loss:** Erro do modelo (menor = melhor)
- **Épocas:** Ciclos de treinamento completados

### 4.3 Limitações
- Modelo não interpreta ironia ou contexto complexo
- Focado apenas em letras em inglês
- Subjetividade inerente ao conceito de misoginia
- Dataset limitado pode afetar performance

## 5. Solução de Problemas

### 5.1 Erro de Dados Insuficientes
- **Problema:** Menos de 10 músicas rotuladas
- **Solução:** Rotule mais músicas na aba "Rotulagem"

### 5.2 Erro de Treinamento
- **Problema:** Falha durante treinamento da CNN
- **Solução:** 
  - Verifique balanceamento do dataset
  - Reduza complexidade se necessário
  - Reinicie o navegador

### 5.3 Problema de Performance
- **Problema:** Sistema lento
- **Solução:**
  - Use navegador atualizado (Chrome/Firefox)
  - Feche abas desnecessárias
  - Modelo roda 100% no navegador

## 6. Requisitos Técnicos

### 6.1 Navegador
- Chrome 90+ (recomendado)
- Firefox 88+
- Safari 14+
- Edge 90+

### 6.2 Hardware Mínimo
- RAM: 4GB
- Processador: Dual-core 2GHz
- Conexão com internet

### 6.3 Para Desenvolvimento Local
- Node.js 18+
- npm ou yarn
- Git

## 7. Contato e Suporte

Para questões acadêmicas ou técnicas, entre em contato com a equipe:

- **Leonardo Bora** - Arquitetura e ML
- **Letícia Campos** - Especialista em ML
- **Carlos Krueger** - Frontend  
- **Nathan** - Backend
- **Luan Constâncio** - Análise de Dados

---

**Versão:** 1.0  
**Data:** Dezembro 2024  
**Disciplina:** Aprendizado de Máquina - Prof. Mozart Hasse
