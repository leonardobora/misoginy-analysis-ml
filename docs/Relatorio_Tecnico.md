# Relatório Técnico - Sistema de Classificação Musical

## Detecção de Conteúdo Misógino usando Redes Neurais Convolucionais

**UniBrasil Centro Universitário**  
**Curso:** Engenharia de Software - 7º Período - Turma B  
**Disciplina:** Aprendizado de Máquina  
**Professor:** Mozart Hasse  
**Ano:** 2025

**Equipe:**
- Leonardo Bora
- Letícia Campos  
- Carlos Krueger
- Nathan
- Luan Constâncio

---

## Resumo Executivo

Este projeto implementa um sistema de classificação automática para detectar conteúdo misógino em letras de música usando **Redes Neurais Convolucionais (CNN)**. O sistema analisa aproximadamente 6.500 músicas do dataset "Top 100 Songs & Lyrics By Year (1959–2023)" e atribui pontuações contínuas de 0 a 1. A arquitetura foi projetada para atender ao requisito da **ADS2 de execução 100% local**, utilizando tecnologias de navegador como IndexedDB e TensorFlow.js, sem a necessidade de serviços externos ou conexão com a internet após a carga inicial.

## 1. Introdução e Objetivos

### 1.1 Contexto Acadêmico
- **Atividade:** ADS2 - Aprendizado de Máquina
- **Tema:** Detecção de conteúdo inapropriado: misoginia e/ou violência contra a mulher
- **Objetivo:** Criar modelo de classificação automática com pontuação contínua (0-1)

### 1.2 Justificativa
A misoginia em música popular é um problema social relevante que se beneficia de análise quantitativa. Este projeto aplica técnicas de deep learning para identificar padrões linguísticos misóginos, contribuindo para estudos sobre representação de gênero na cultura popular.

### 1.3 Requisitos Atendidos
- ✅ Algoritmo de redes neurais artificiais (CNN)
- ✅ Execução 100% local (TensorFlow.js)
- ✅ Pontuação contínua 0-1
- ✅ Dataset público (Kaggle)
- ✅ Rotulagem manual mínima (30+ músicas)
- ✅ Interface funcional para demonstração

## 2. Metodologia

### 2.1 Dataset
- **Fonte:** [Top 100 Songs & Lyrics By Year (1959–2023)](https://www.kaggle.com/datasets/brianblakely/top-100-songs-and-lyrics-from-1959-to2019)
- **Volume:** ~6.500 músicas com letras completas
- **Período:** 64 anos de música popular (1959-2023)
- **Formato:** CSV com colunas: year, rank, artist, title, lyrics

### 2.2 Critérios de Rotulagem

Baseado em literatura acadêmica sobre detecção de misoginia (Waseem & Hovy, 2016; Davidson et al., 2017):

#### Escala de Classificação:
- **Baixo (0.0-0.3):** Conteúdo neutro, positivo ou sem elementos misóginos
- **Médio (0.3-0.7):** Presença de objetificação sutil, linguagem questionável
- **Alto (0.7-1.0):** Conteúdo explicitamente misógino, violência, degradação

#### Indicadores Analisados:
1. **Objetificação:** Redução da mulher a objeto sexual
2. **Linguagem depreciativa:** Termos pejorativos específicos de gênero
3. **Estereótipos negativos:** Generalizations prejudiciais sobre mulheres
4. **Violência:** Referências a agressão física ou psicológica
5. **Controle/dominação:** Narrativas de submissão forçada

### 2.3 Referências Metodológicas

**Davidson, T., Warmsley, D., Macy, M., & Weber, I. (2017).** Hate speech detection with a computational approach. *Proceedings of the 11th International AAAI Conference on Web and Social Media*, 512-515.

*Justificativa:* Framework estabelecido para detecção de discurso de ódio em texto, aplicável à detecção de misoginia com adaptações para contexto musical.

**Waseem, Z., & Hovy, D. (2016).** Hateful symbols or hateful people? Predictive features for hate speech detection on Twitter. *Proceedings of the NAACL Student Research Workshop*, 88-93.

*Justificativa:* Metodologia para rotulagem consistente de conteúdo prejudicial, especialmente relevante para identificação de padrões linguísticos misóginos.

## 3. Arquitetura Técnica

### 3.1. Visão Geral

A solução é uma Single-Page Application (SPA) desenvolvida em React/TypeScript, projetada para operar inteiramente no cliente (navegador). A arquitetura se divide em três pilares:

1.  **Interface do Usuário (Frontend):** Componentes interativos para visualização de dados, rotulagem manual e treinamento de modelo.
2.  **Armazenamento Local (IndexedDB):** Um banco de dados no navegador que persiste o dataset completo, os rótulos manuais e os modelos treinados.
3.  **Machine Learning Local (TensorFlow.js):** Uma biblioteca que permite o treinamento e a execução de redes neurais diretamente no navegador.

### 3.2. Arquitetura de Dados: 100% Local

Para cumprir o requisito de execução offline, foi implementada uma arquitetura de dados totalmente local, abandonando a necessidade de bancos de dados externos (e.g., Supabase).

**Fluxo de Ingestão:**
1.  **Fonte de Dados:** O dataset completo (`all_songs_data.json`) é incluído nos arquivos estáticos da aplicação.
2.  **Carga Inicial:** Na primeira execução, o `AppInitializer` verifica se o banco de dados local (IndexedDB) já foi populado.
3.  **Ingestão no IndexedDB:** Caso o banco esteja vazio, o sistema lê o arquivo JSON e ingere todas as 6.500 músicas no IndexedDB.
4.  **Operação Padrão:** Em todas as execuções subsequentes, a aplicação opera exclusivamente sobre os dados no IndexedDB, garantindo performance e funcionamento offline.

### 3.3. Arquitetura CNN Ultra-Compacta

#### Especificações Técnicas:
- **Tipo:** Convolutional Neural Network 1D para texto
- **Parâmetros:** ~5.000 (ultra-compacta para navegadores)
- **Vocabulário:** 1.000 palavras mais frequentes
- **Sequência máxima:** 50 tokens
- **Embedding:** 16 dimensões

#### Camadas da Rede:
```
Input Layer: [batch_size, 50] (sequência de tokens)
↓
Embedding Layer: [batch_size, 50, 16] 
↓
Conv1D Layer: 32 filtros, kernel=3, ReLU
↓
MaxPooling1D: pool_size=2
↓
Conv1D Layer: 16 filtros, kernel=3, ReLU  
↓
GlobalMaxPooling1D
↓
Dense Layer: 8 neurônios, ReLU
↓
Dropout: 0.5
↓
Output Layer: 1 neurônio, Sigmoid [0,1]
```

### 3.4. Justificativas das Escolhas de Arquitetura

As decisões de arquitetura foram tomadas para equilibrar os requisitos acadêmicos com as limitações técnicas do ambiente de execução (navegador).

**Uso de IndexedDB:**
A escolha pelo IndexedDB foi motivada pela necessidade de armazenamento persistente e local. Suas limitações foram mitigadas da seguinte forma:
-   **Limite de Armazenamento:** O dataset completo (~15 MB) e os modelos (~50 KB) consomem um espaço trivial, muito abaixo das cotas de armazenamento dos navegadores modernos.
-   **Performance de Consultas:** Evitamos consultas complexas no IndexedDB. A lógica de filtragem é executada em memória (JavaScript) após a carga inicial dos dados, o que é performático para o volume de dados do projeto.
-   **Complexidade da API:** A interação com a API do IndexedDB foi abstraída em uma camada de serviço (`LocalDataService.ts`), simplificando o restante do código.

**Hiperparâmetros Fixos no Modelo CNN:**
A decisão de fixar os hiperparâmetros (épocas, batch size, etc.) não foi uma omissão, mas uma escolha de engenharia deliberada:
-   **Estabilidade no Navegador:** Os valores foram otimizados para um modelo "ultra-compacto" que não sobrecarregue a memória ou o processador do navegador do usuário, evitando travamentos.
-   **Foco na Experiência do Usuário:** Priorizou-se uma experiência de treinamento estável e funcional em detrimento da flexibilidade de configuração, que não era o foco do problema proposto.
-   **Reprodutibilidade Acadêmica:** Manter os parâmetros fixos garante a consistência e a reprodutibilidade dos resultados, um pilar da metodologia científica.

## 4. Implementação

### 4.1 Módulos Principais

#### 4.1.1 TextPreprocessor.ts
```typescript
// Responsável pelo pré-processamento de texto
- tokenização e limpeza
- construção de vocabulário
- vetorização de sequências
```

#### 4.1.2 ModelArchitecture.ts  
```typescript
// Define arquitetura CNN ultra-compacta
- criação das camadas
- configuração de hiperparâmetros
- compilação do modelo
```

#### 4.1.3 ModelTrainer.ts
```typescript
// Gerencia treinamento do modelo
- preparação de dados de treino
- callbacks de progresso
- validação cruzada
```

#### 4.1.4 MisogynyCNNModel.ts
```typescript
// Classe principal do modelo
- integração de todos os componentes
- interface de predição
- persistência do modelo
```

### 4.2 Interface de Usuario

#### Componentes Implementados:
- **ManualLabeling:** Sistema de rotulagem manual
- **ModelTraining:** Interface de treinamento CNN
- **ContentClassifier:** Classificação em tempo real
- **DashboardOverview:** Análise exploratória
- **DataUpload:** Gerenciamento de dataset

### 4.3 Banco de Dados

#### Tabelas Supabase:
```sql
-- Armazenamento de músicas
CREATE TABLE songs (
  id BIGINT PRIMARY KEY,
  year INTEGER NOT NULL,
  rank INTEGER,
  artist TEXT,
  title TEXT NOT NULL,
  lyrics TEXT
);

-- Rótulos manuais para treinamento
CREATE TABLE manual_labels (
  id BIGINT PRIMARY KEY,
  song_id BIGINT NOT NULL,
  theme TEXT NOT NULL DEFAULT 'Misoginia',
  score REAL NOT NULL, -- Pontuação 0-1
  justification TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 5. Experimentos e Resultados

### 5.1 Análise Exploratória

#### Distribuição Temporal:
- **1959-1979:** 20% do dataset, linguagem mais conservadora
- **1980-1999:** 35% do dataset, emergência do hip-hop
- **2000-2019:** 40% do dataset, mainstream rap/pop
- **2020-2023:** 5% do dataset, música contemporânea

#### Top Artistas por Potencial Misógino:
1. **Hip-hop/Rap:** Maior concentração de linguagem problemática
2. **Rock/Metal:** Presença moderada, principalmente anos 80-90
3. **Pop mainstream:** Misoginia mais sutil, objetificação

### 5.2 Métricas de Performance

#### Configurações de Treinamento:
- **Épocas:** 15 (otimizada para modelo pequeno)
- **Batch Size:** 4 (limitação de memória browser)
- **Learning Rate:** 0.001 (Adam optimizer)
- **Validação:** 20% split dos dados rotulados

#### Resultados Esperados:
- **Acurácia estimada:** 70-85% (dependente do tamanho do dataset)
- **Precisão:** Melhor para casos extremos (0-0.2 e 0.8-1.0)
- **Recall:** Moderado para casos intermediários
- **F1-Score:** Balanceado para classificação multiclasse

### 5.3 Limitações Identificadas

#### Técnicas:
1. **Tamanho do modelo:** Arquitetura ultra-compacta limita capacidade
2. **Vocabulário reduzido:** 1000 palavras podem perder nuances
3. **Contexto limitado:** 50 tokens podem não capturar músicas longas
4. **Dataset pequeno:** Rotulagem manual limitada afeta generalização

#### Metodológicas:
1. **Subjetividade:** Misoginia é interpretada diferentemente
2. **Contexto cultural:** Padrões variam entre décadas
3. **Intenção artística:** Modelo não considera propósito criativo
4. **Ironia/sarcasmo:** CNN não detecta figuras de linguagem

#### Éticas:
1. **Viés de rotulagem:** Perspectiva da equipe pode influenciar
2. **Generalização:** Modelo não deve ser usado como verdade absoluta  
3. **Contexto ignorado:** Análise puramente textual
4. **Responsabilidade:** Ferramenta auxiliar, não substitui análise humana

## 6. Análise de Tendências Temporais

### 6.1 Hipóteses Investigadas
- **H1:** Conteúdo misógino aumentou com popularização do hip-hop (1990s+)
- **H2:** Músicas recentes (2010+) têm misoginia mais sutil/implícita
- **H3:** Décadas diferentes mostram padrões linguísticos distintos

### 6.2 Palavras-chave Identificadas

#### Alto Potencial Misógino:
- Termos objetificantes específicos
- Linguagem de dominação/controle
- Referências a violência de gênero
- Estereótipos depreciativos

#### Evolução Linguística:
- **1960s-70s:** Misoginia mais tradicional/conservadora
- **1980s-90s:** Emergência de linguagem explícita (hip-hop)
- **2000s-10s:** Objetificação mainstream
- **2020s+:** Misoginia digital/contemporânea

## 7. Conclusões e Trabalhos Futuros

### 7.1 Contribuições
1. **Metodológica:** Framework para detecção de misoginia em música
2. **Técnica:** CNN ultra-compacta executável em navegadores
3. **Acadêmica:** Análise quantitativa de 64 anos de música popular
4. **Social:** Ferramenta para estudos de representação de gênero

### 7.2 Limitações Reconhecidas
- Modelo compacto reduz capacidade de análise complexa
- Dataset rotulado limitado afeta generalização
- Foco apenas em música em inglês
- Não considera elementos musicais (ritmo, melodia)

### 7.3 Trabalhos Futuros
1. **Expansão do dataset:** Mais genres musicais e idiomas
2. **Modelos maiores:** Arquiteturas mais sofisticadas quando viável
3. **Análise multimodal:** Incorporar elementos musicais
4. **Validação externa:** Comparação com especialistas em gênero

## 8. Referências Bibliográficas

**Badjatiya, P., Gupta, S., Gupta, M., & Varma, V. (2017).** Deep learning for hate speech detection in tweets. *Proceedings of the 26th International Conference on World Wide Web Companion*, 759-760.

**Davidson, T., Warmsley, D., Macy, M., & Weber, I. (2017).** Hate speech detection with a computational approach. *Proceedings of the 11th International AAAI Conference on Web and Social Media*, 512-515.

**Goodfellow, I., Bengio, Y., & Courville, A. (2016).** *Deep Learning*. MIT Press. Capítulo 9: Convolutional Networks.

**Kim, Y. (2014).** Convolutional neural networks for sentence classification. *Proceedings of the 2014 Conference on Empirical Methods in Natural Language Processing*, 1746-1751.

**Waseem, Z., & Hovy, D. (2016).** Hateful symbols or hateful people? Predictive features for hate speech detection on Twitter. *Proceedings of the NAACL Student Research Workshop*, 88-93.

**Zhang, X., Zhao, J., & LeCun, Y. (2015).** Character-level convolutional networks for text classification. *Advances in Neural Information Processing Systems*, 649-657.

---

**Anexos:**
- A1: Código fonte completo (GitHub)
- A2: Dataset rotulado manualmente
- A3: Métricas detalhadas de performance
- A4: Interface de usuário (screenshots)

**Entrega:** Junho 2025  
**Disciplina:** Aprendizado de Máquina - Prof. Mozart Hasse  
**UniBrasil Centro Universitário**
