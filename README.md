
# Sistema de Classificação Musical - Detecção de Misoginia

## 📋 Sobre o Projeto

Sistema desenvolvido para a **Atividade Discente Supervisionada 2 (ADS2)** da disciplina de **Aprendizado de Máquina**, sob orientação do **Prof. Mozart Hasse**. O projeto implementa uma **Rede Neural Convolucional (CNN)** para detectar conteúdo misógino em letras de música do dataset "Top 100 Songs & Lyrics By Year (1959–2023)".

### 🎯 Objetivo

Criar um modelo de classificação automática que analisa letras de músicas e atribui uma **pontuação de intensidade de conteúdo misógino** na escala de 0 a 1, onde:
- **0**: música sem conteúdo inapropriado
- **1**: letra com conteúdo flagrantemente misógino

## 🏫 Instituição de Ensino

**UniBrasil Centro Universitário**

## 👥 Equipe de Desenvolvimento

**Curso:** Engenharia de Software - 7º Período - Turma B

| Nome | Papel | Responsabilidades |
|------|-------|-------------------|
| **Leonardo Bora** | Desenvolvedor Full-Stack | Arquitetura do sistema, modelagem CNN |
| **Letícia Campos** | Especialista em ML | Treinamento de modelos, análise de dados |
| **Carlos Krueger** | Desenvolvedor Frontend | Interface do usuário, visualizações |
| **Nathan** | Desenvolvedor Backend | APIs, integração de dados |
| **Luan Constâncio** | Analista de Dados | Rotulagem manual, pré-processamento |

## 🚀 Tecnologias Utilizadas

- **Frontend:** React 18 + TypeScript
- **UI Framework:** Tailwind CSS + shadcn/ui
- **Machine Learning:** TensorFlow.js (CNN)
- **Database:** Supabase (PostgreSQL)
- **Build Tool:** Vite

## 🏗️ Arquitetura do Sistema

### Componentes Principais

1. **Interface Web Responsiva**
   - Dashboard analítico
   - Classificador em tempo real
   - Sistema de rotulagem manual
   - Gerenciamento de dados

2. **Modelo CNN Local**
   - Arquitetura personalizada para texto
   - Treinamento 100% local
   - Predição em tempo real
   - Armazenamento persistente

3. **Pipeline de Dados**
   - Pré-processamento de texto
   - Tokenização e vetorização
   - Validação e limpeza

## 💻 Instalação e Configuração Local

### Pré-requisitos

#### Windows
- **Node.js 18+**: [Download](https://nodejs.org/)
- **Git**: [Download](https://git-scm.com/download/win)
- **VSCode** (recomendado): [Download](https://code.visualstudio.com/)

#### Linux (Ubuntu/Debian)
```bash
# Atualizar repositórios
sudo apt update

# Instalar Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar Git
sudo apt install git

# Verificar instalações
node --version
npm --version
git --version
```

#### Linux (CentOS/RHEL/Fedora)
```bash
# Instalar Node.js 18+
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Instalar Git
sudo yum install git
```

### Instalação do Projeto

#### 1. Clone o Repositório
```bash
# Clone o projeto
git clone https://github.com/[SEU_USUARIO]/sistema-classificacao-musical.git
cd sistema-classificacao-musical
```

#### 2. Instale as Dependências
```bash
# Instalar dependências do projeto
npm install

# Aguarde a instalação (pode demorar alguns minutos)
```

#### 3. Configure as Variáveis de Ambiente
```bash
# Windows (PowerShell)
copy .env.example .env.local

# Linux/Mac
cp .env.example .env.local
```

Edite o arquivo `.env.local` com um editor de texto:

```env
# Configurações do Supabase (Opcional)
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima

# Configurações de desenvolvimento
VITE_ENV=development
```

**Nota:** O sistema funciona sem Supabase, usando armazenamento local do navegador.

#### 4. Execute o Projeto

```bash
# Iniciar servidor de desenvolvimento
npm run dev
```

Aguarde a mensagem:
```
Local:   http://localhost:8080
Network: http://192.168.x.x:8080
```

#### 5. Acesse o Sistema
- Abra seu navegador
- Acesse: `http://localhost:8080`
- O sistema deve carregar com todas as funcionalidades

### Solução de Problemas Comuns

#### Windows
```powershell
# Se houver erro de permissão no PowerShell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Se npm install falhar
npm cache clean --force
npm install
```

#### Linux
```bash
# Se houver problemas de permissão
sudo chown -R $(whoami) ~/.npm

# Se faltar dependências nativas
sudo apt install build-essential

# Limpar cache se necessário
npm cache clean --force
```

#### Problemas de Porta
Se a porta 8080 estiver ocupada:
```bash
# Usar porta alternativa
npm run dev -- --port 3000
```

## 🎵 Dataset

**Fonte:** [Top 100 Songs & Lyrics By Year (1959–2023)](https://www.kaggle.com/datasets/brianblakely/top-100-songs-and-lyrics-from-1959-to2019)

- **Volume:** ~6.500 músicas com letras completas
- **Período:** 1959-2023 (64 anos de música popular)
- **Formato:** CSV com colunas: ano, artista, música, letra, posição no ranking

## 🤖 Metodologia de ML

### Abordagem CNN para Texto

1. **Pré-processamento:**
   - Tokenização de texto
   - Remoção de stopwords
   - Normalização e limpeza
   - Vetorização com embeddings

2. **Arquitetura CNN:**
   - Camadas convolucionais 1D
   - Max pooling temporal
   - Dropout para regularização
   - Camada densa final para classificação

3. **Treinamento:**
   - Dataset rotulado manualmente (30+ músicas)
   - Validação cruzada
   - Métricas: Acurácia, Precisão, Recall, F1-Score

### Critérios de Rotulagem

Baseado em literatura acadêmica sobre detecção de misoginia:

- **Baixo (0.0-0.3):** Conteúdo neutro ou positivo
- **Médio (0.3-0.7):** Linguagem questionável, objetificação sutil
- **Alto (0.7-1.0):** Conteúdo explicitamente misógino

## 🔧 Como Usar

### 1. Rotulagem Manual
- Acesse a aba "Rotulagem"
- Selecione músicas do dataset
- Atribua pontuações de 0 a 1
- Salve as classificações

### 2. Treinamento do Modelo
- Vá para "Treinamento"
- Configure hiperparâmetros
- Inicie o treinamento local
- Monitore métricas em tempo real

### 3. Classificação Automática
- Use a aba "Classificador"
- Cole letras de música
- Obtenha pontuação automática
- Visualize análise detalhada

### 4. Dashboard Analítico
- Veja estatísticas gerais
- Analise tendências temporais
- Compare resultados

## 📊 Funcionalidades

- ✅ **Classificação em tempo real** com CNN local
- ✅ **Interface web responsiva** e intuitiva
- ✅ **Sistema de rotulagem manual** para treinamento
- ✅ **Dashboard analítico** com visualizações
- ✅ **Gerenciamento de dataset** completo
- ✅ **Treinamento local** sem dependências externas
- ✅ **Métricas de performance** detalhadas
- ✅ **Armazenamento persistente** de modelos

## 🎯 Requisitos Acadêmicos Atendidos

### Técnicos
- [x] Algoritmo de redes neurais artificiais (CNN)
- [x] Execução 100% local (sem serviços externos)
- [x] Análise exploratória do dataset
- [x] Rotulagem manual de 30+ músicas
- [x] Pontuação contínua entre 0 e 1
- [x] Interface funcional para demonstração

### Documentação
- [x] Relatório técnico detalhado
- [x] Justificativas metodológicas com referências
- [x] Análise de limitações éticas e técnicas
- [x] Ranking de músicas classificadas
- [x] Código organizado e comentado
- [x] Apresentação final

## 🚨 Limitações e Considerações Éticas

### Limitações Técnicas
- **Contexto:** Modelo não interpreta contexto complexo ou ironia
- **Tamanho:** Dataset limitado para treinamento robusto
- **Idioma:** Focado apenas em letras em inglês
- **Subjetividade:** Misoginia pode ser interpretada diferentemente

### Limitações Éticas
- **Viés:** Possível viés nos dados de treinamento
- **Interpretação:** Modelo não considera intenção artística
- **Contexto Cultural:** Não considera diferenças culturais/temporais
- **Responsabilidade:** Ferramenta auxiliar, não substitui análise humana

## 📈 Estrutura do Projeto

```
src/
├── components/           # Componentes React
│   ├── ui/              # Componentes de interface
│   ├── ContentClassifier.tsx
│   ├── ModelTraining.tsx
│   ├── ManualLabeling.tsx
│   └── DashboardOverview.tsx
├── services/            # Serviços de ML e dados
│   ├── MisogynyCNNModel.ts
│   ├── TextPreprocessor.ts
│   ├── ModelTrainer.ts
│   └── ModelStorage.ts
├── types/               # Definições TypeScript
└── pages/               # Páginas da aplicação
```

## 🧪 Testes

```bash
# Executar testes unitários
npm run test

# Executar testes de integração
npm run test:integration

# Cobertura de testes
npm run test:coverage
```

## 📚 Referências Acadêmicas

1. Zhang, X., Zhao, J., & LeCun, Y. (2015). Character-level convolutional networks for text classification.
2. Waseem, Z., & Hovy, D. (2016). Hateful symbols or hateful people? Predictive features for hate speech detection on Twitter.
3. Badjatiya, P., et al. (2017). Deep learning for hate speech detection in tweets.
4. Davidson, T., et al. (2017). Hate speech detection with a computational approach.

## 📝 Licença

Este projeto foi desenvolvido para fins acadêmicos como parte da disciplina de Aprendizado de Máquina.

## 🤝 Contribuição

Este é um projeto acadêmico fechado. Para dúvidas ou sugestões, entre em contato com a equipe.

---

**Desenvolvido com ❤️ pela equipe de Engenharia de Software - UniBrasil Centro Universitário 2025**
