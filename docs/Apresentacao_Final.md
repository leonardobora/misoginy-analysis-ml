
# Apresentação Final - Sistema de Classificação Musical

## Detecção de Misoginia usando CNN Ultra-Compacta

**UFPR - Engenharia de Software - 7º Período - Turma B**  
**Aprendizado de Máquina - Prof. Mozart Hasse**

---

## 🎯 **SLIDE 1: Título e Equipe**

### Sistema de Classificação Musical
**Detecção Automática de Conteúdo Misógino usando CNNs**

**Equipe:**
- **Leonardo Bora** - Arquitetura e Machine Learning
- **Letícia Campos** - Especialista em ML e Análise
- **Carlos Krueger** - Desenvolvimento Frontend  
- **Nathan** - Desenvolvimento Backend
- **Luan Constâncio** - Análise de Dados e Rotulagem

**ADS2 - Dezembro 2024**

---

## 🎵 **SLIDE 2: Problema e Contexto**

### Por que detectar misoginia em música?

- **64 anos** de música popular (1959-2023)
- **~6.500 músicas** do top 100 anual
- **Impacto social:** Música influencia percepções sobre gênero
- **Desafio técnico:** Análise automatizada de conteúdo sensível

### Exemplos de Evolução:
- **1960s:** "Under My Thumb" - Rolling Stones
- **1990s:** Hip-hop mainstream com linguagem explícita  
- **2010s:** Pop com objetificação sutil
- **2020s:** Misoginia digital e contemporânea

---

## 🤖 **SLIDE 3: Solução Técnica**

### CNN Ultra-Compacta (100% Local)

```
Input (50 tokens) → Embedding (16D) → Conv1D (32) → 
MaxPool → Conv1D (16) → GlobalMaxPool → 
Dense (8) → Dropout → Sigmoid [0,1]
```

**Características:**
- **~5.000 parâmetros** (ultra-compacta)
- **TensorFlow.js** (execução no navegador)
- **Vocabulário:** 1.000 palavras essenciais
- **Pontuação contínua:** 0.0 (sem misoginia) → 1.0 (extremamente misógino)

**Por que CNN?** Detecta padrões locais em sequências de texto

---

## 📊 **SLIDE 4: Metodologia de Rotulagem**

### Critérios Acadêmicos Baseados em Literatura

**Referência Principal:** Davidson et al. (2017) - Hate Speech Detection

#### Escala de Classificação:
- **🟢 Baixo (0.0-0.3):** Neutro, sem elementos misóginos
- **🟡 Médio (0.3-0.7):** Objetificação sutil, linguagem questionável  
- **🔴 Alto (0.7-1.0):** Misoginia explícita, violência, degradação

#### Indicadores Analisados:
1. **Objetificação** sexual feminina
2. **Linguagem depreciativa** específica de gênero
3. **Estereótipos negativos** sobre mulheres
4. **Referências à violência** física/psicológica
5. **Narrativas de dominação** e controle

---

## 💻 **SLIDE 5: Arquitetura do Sistema**

### Stack Tecnológico Completo

**Frontend Responsivo:**
- React 18 + TypeScript
- Tailwind CSS + shadcn/ui
- Interface com 7 abas funcionais

**Machine Learning Local:**
- TensorFlow.js para CNN
- Processamento de texto integrado
- Treinamento em tempo real

**Backend e Dados:**
- Supabase (PostgreSQL)
- Dataset Kaggle integrado
- Sistema de rotulagem persistente

**Deploy Profissional:**
- Lovable Platform
- GitHub Actions
- Domínio personalizado

---

## 📈 **SLIDE 6: Funcionalidades Implementadas**

### Sistema Completo e Funcional

1. **📊 Dashboard Analítico**
   - Visualizações temporais (1959-2023)
   - Top artistas por década
   - Análise de frequência de palavras

2. **🎵 Classificador em Tempo Real**
   - Cole letra → Obtenha pontuação
   - Análise detalhada e justificativa
   - Interface intuitiva

3. **🏷️ Rotulagem Manual Inteligente**
   - Filtros por período/artista
   - Sistema de pontuação preciso
   - Justificativas obrigatórias

4. **🧠 Treinamento CNN Local**
   - Monitoramento em tempo real
   - Métricas de performance
   - Modelo persistente

---

## 🎯 **SLIDE 7: Demonstração Prática**

### Live Demo - Sistema em Funcionamento

**Cenário 1: Análise de Música Clássica**
- Input: "Yesterday" - Beatles (1965)
- Output: Score baixo (~0.1) - Conteúdo romântico neutro

**Cenário 2: Hip-hop Contemporâneo**
- Input: Música com linguagem objetificante
- Output: Score alto (~0.8) - Linguagem explicitamente problemática

**Cenário 3: Pop Mainstream**
- Input: Música com objetificação sutil
- Output: Score médio (~0.5) - Elementos questionáveis

**Interface:** Navegação entre abas, filtros inteligentes, visualizações

---

## 📊 **SLIDE 8: Resultados e Métricas**

### Performance do Modelo Ultra-Compacto

**Configuração de Treinamento:**
- ✅ **Épocas:** 15 (otimizado para modelo pequeno)
- ✅ **Batch Size:** 4 (limitação de memória)
- ✅ **Learning Rate:** 0.001 (Adam optimizer)
- ✅ **Validação:** 20% dos dados rotulados

**Métricas Esperadas:**
- **Acurácia:** 70-85% (dataset dependente)
- **Precisão:** Alta para casos extremos
- **Recall:** Moderado para casos intermediários  
- **Tempo de inferência:** <100ms por música

**Balanceamento do Dataset:**
- Crítico para performance
- Sistema detecta desbalanceamento
- Recomendações automáticas

---

## 🕒 **SLIDE 9: Análise Temporal**

### 64 Anos de Evolução Musical

**Tendências Identificadas:**

**📊 Por Década:**
- **1960s-70s:** Misoginia tradicional/conservadora
- **1980s-90s:** Emergência do hip-hop explícito
- **2000s-10s:** Objetificação mainstream no pop
- **2020s+:** Misoginia digital e linguagem sutil

**🎸 Por Gênero Musical:**
- **Hip-hop/Rap:** Maior concentração de conteúdo problemático
- **Rock/Metal:** Presença moderada (anos 80-90)
- **Pop:** Misoginia mais sutil, objetificação

**📈 Insight Principal:** Linguagem evoluiu de explícita para implícita

---

## ⚠️ **SLIDE 10: Limitações e Considerações Éticas**

### Transparência Acadêmica

**Limitações Técnicas:**
- 🔸 **Modelo ultra-compacto** reduz capacidade analítica
- 🔸 **Vocabulário limitado** (1000 palavras) perde nuances
- 🔸 **Contexto reduzido** (50 tokens) para músicas longas
- 🔸 **Dataset pequeno** afeta generalização

**Limitações Metodológicas:**
- 🔸 **Subjetividade inerente** na definição de misoginia
- 🔸 **Contexto cultural ignorado** (diferenças temporais/regionais)
- 🔸 **Intenção artística** não considerada
- 🔸 **Ironia/sarcasmo** não detectados

**Considerações Éticas:**
- 🔸 **Viés de rotulagem** da equipe
- 🔸 **Ferramenta auxiliar** - não substitui análise humana
- 🔸 **Responsabilidade** na interpretação dos resultados

---

## 🎯 **SLIDE 11: Requisitos ADS2 Atendidos**

### Checklist Completo ✅

**Técnicos:**
- ✅ **Algoritmo de redes neurais** (CNN)
- ✅ **Execução 100% local** (TensorFlow.js)
- ✅ **Dataset público** (Kaggle)
- ✅ **Pontuação contínua 0-1**
- ✅ **Rotulagem manual** (30+ músicas)
- ✅ **Interface funcional** (React)

**Acadêmicos:**
- ✅ **Relatório técnico** com metodologia
- ✅ **Justificativas com referências** (ABNT)
- ✅ **Análise de limitações** éticas/técnicas
- ✅ **Ranking de músicas** classificadas
- ✅ **Código organizado** e comentado
- ✅ **Apresentação final** (esta!)

---

## 🚀 **SLIDE 12: Contribuições e Impacto**

### Valor Acadêmico e Social

**Contribuições Técnicas:**
- 🎯 **Framework** para detecção de misoginia em música
- 🎯 **CNN ultra-compacta** executável em navegadores
- 🎯 **Sistema completo** de rotulagem e análise
- 🎯 **Interface responsiva** para pesquisa

**Contribuições Acadêmicas:**
- 📚 **Análise quantitativa** de 64 anos de música popular
- 📚 **Metodologia replicável** para outros domínios
- 📚 **Documentação completa** para futuros trabalhos

**Impacto Social:**
- 🌍 **Ferramenta para estudos** de representação de gênero
- 🌍 **Conscientização** sobre misoginia na cultura popular
- 🌍 **Base para políticas** de conteúdo em plataformas

---

## 🔮 **SLIDE 13: Trabalhos Futuros**

### Evolução do Projeto

**Melhorias Técnicas:**
- 🔧 **Modelos maiores** quando viabilidade permitir
- 🔧 **Análise multimodal** (incorporar ritmo, melodia)
- 🔧 **Expansão de idiomas** (português, espanhol)
- 🔧 **Transfer learning** com modelos pré-treinados

**Expansão do Dataset:**
- 📊 **Mais gêneros musicais** (reggae, eletrônica, folk)
- 📊 **Outras décadas** (pré-1959)
- 📊 **Música independente** além do mainstream
- 📊 **Rotulagem colaborativa** com especialistas

**Aplicações Avançadas:**
- 🎵 **API pública** para desenvolvedores
- 🎵 **Plugin para Spotify** de análise automática
- 🎵 **Dashboard educacional** para estudos de gênero
- 🎵 **Comparação entre países** e culturas

---

## 🎉 **SLIDE 14: Demonstração Final**

### Sistema Completo em Funcionamento

**Acesso ao Sistema:**
- 🌐 **Web:** [URL quando publicado]
- 💻 **Local:** GitHub + npm install + npm run dev
- 📱 **Mobile:** Interface responsiva

**Repositório GitHub:**
- 📁 **Código completo** documentado
- 📋 **README detalhado** com instruções
- 📊 **Dataset rotulado** incluso
- 🔧 **Scripts de instalação** automatizados

**Entregáveis:**
- ✅ **Manual do usuário** (PDF)
- ✅ **Relatório técnico** (PDF)  
- ✅ **Código fonte** (GitHub)
- ✅ **Apresentação** (PowerPoint)
- ✅ **Sistema funcional** (Deploy)

---

## 💡 **SLIDE 15: Conclusões**

### Aprendizados e Conquistas

**Sucessos do Projeto:**
- 🎯 **CNN ultra-compacta** funcional em navegadores
- 🎯 **Sistema completo** de ponta a ponta
- 🎯 **Interface profissional** e intuitiva
- 🎯 **Metodologia acadêmica** rigorosa
- 🎯 **Todos os requisitos** ADS2 atendidos

**Aprendizados da Equipe:**
- 🧠 **Deep Learning** prático com TensorFlow.js
- 🧠 **Desenvolvimento full-stack** moderno
- 🧠 **Trabalho em equipe** multidisciplinar
- 🧠 **Metodologia científica** aplicada
- 🧠 **Considerações éticas** em IA

**Mensagem Final:**
*"Demonstramos que é possível criar sistemas de ML éticos, funcionais e academicamente rigorosos, contribuindo para o entendimento da representação de gênero na música popular."*

---

## ❓ **SLIDE 16: Perguntas e Discussão**

### Obrigado pela Atenção!

**Equipe disponível para esclarecimentos:**

- **Leonardo Bora** - Arquitetura e Machine Learning
- **Letícia Campos** - Especialista em ML e Análise
- **Carlos Krueger** - Desenvolvimento Frontend  
- **Nathan** - Desenvolvimento Backend
- **Luan Constâncio** - Análise de Dados

**Contatos acadêmicos disponíveis após a apresentação**

**Sistema online para demonstrações adicionais**

---

### 🎵 *"Music is a universal language, but we must ensure it speaks of equality, not oppression."*

**UFPR - Engenharia de Software - Prof. Mozart Hasse**
