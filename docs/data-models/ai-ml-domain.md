# AI/ML Domain Data Models

## Core Entities

### AIModel
```typescript
interface AIModel {
  id: UUID;
  name: string;
  version: string;
  type: ModelType;
  framework: MLFramework;
  architecture: string;
  parameters: ModelParameters;
  performance: ModelPerformance;
  status: ModelStatus;
  deploymentUrl?: string;
  trainingDatasetId: UUID;
  validationMetrics: Record<string, any>;
  createdBy: UUID;
  trainedAt: DateTime;
  deployedAt?: DateTime;
  deprecatedAt?: DateTime;
  createdAt: DateTime;
  updatedAt: DateTime;
}

enum ModelType {
  CLASSIFICATION = 'classification',
  REGRESSION = 'regression',
  TIME_SERIES = 'time_series',
  NLP = 'nlp',
  REINFORCEMENT = 'reinforcement',
  GENERATIVE = 'generative'
}

enum MLFramework {
  TENSORFLOW = 'tensorflow',
  PYTORCH = 'pytorch',
  SCIKIT_LEARN = 'scikit_learn',
  XGBOOST = 'xgboost',
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  HUGGINGFACE = 'huggingface'
}

enum ModelStatus {
  TRAINING = 'training',
  VALIDATING = 'validating',
  READY = 'ready',
  DEPLOYED = 'deployed',
  DEPRECATED = 'deprecated',
  FAILED = 'failed'
}

interface ModelParameters {
  inputShape?: number[];
  outputShape?: number[];
  layers?: number;
  neurons?: number;
  learningRate?: number;
  batchSize?: number;
  epochs?: number;
  optimizer?: string;
  lossFunction?: string;
  customParams?: Record<string, any>;
}

interface ModelPerformance {
  accuracy?: number;
  precision?: number;
  recall?: number;
  f1Score?: number;
  mse?: number;
  mae?: number;
  rmse?: number;
  auc?: number;
  latencyMs?: number;
  throughput?: number;
}
```

### Prediction
```typescript
interface Prediction {
  id: UUID;
  modelId: UUID;
  userId?: UUID;
  requestId: string;
  input: Record<string, any>;
  output: PredictionOutput;
  confidence: number;
  latencyMs: number;
  status: PredictionStatus;
  feedback?: PredictionFeedback;
  metadata?: Record<string, any>;
  createdAt: DateTime;
}

interface PredictionOutput {
  value: any;
  probabilities?: Record<string, number>;
  explanation?: string;
  features?: Record<string, number>;
}

enum PredictionStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  TIMEOUT = 'timeout'
}

interface PredictionFeedback {
  isCorrect?: boolean;
  actualValue?: any;
  rating?: number;
  comment?: string;
  feedbackAt: DateTime;
}
```

### Dataset
```typescript
interface Dataset {
  id: UUID;
  name: string;
  description: string;
  type: DatasetType;
  source: DataSource;
  features: DatasetFeature[];
  size: number;
  splits: DatasetSplit;
  preprocessingSteps: PreprocessingStep[];
  status: DatasetStatus;
  quality: DataQuality;
  storageLocation: string;
  createdBy: UUID;
  createdAt: DateTime;
  updatedAt: DateTime;
}

enum DatasetType {
  TRAINING = 'training',
  VALIDATION = 'validation',
  TEST = 'test',
  PRODUCTION = 'production'
}

interface DataSource {
  type: 'database' | 'api' | 'file' | 'stream';
  uri: string;
  credentials?: Record<string, any>;
  query?: string;
  format?: string;
}

interface DatasetFeature {
  name: string;
  type: 'numeric' | 'categorical' | 'text' | 'datetime' | 'binary';
  statistics: FeatureStatistics;
  importance?: number;
}

interface FeatureStatistics {
  mean?: number;
  median?: number;
  std?: number;
  min?: number;
  max?: number;
  unique?: number;
  missing?: number;
  distribution?: Record<string, number>;
}

interface DatasetSplit {
  train: number;
  validation: number;
  test: number;
}

interface PreprocessingStep {
  type: string;
  parameters: Record<string, any>;
  order: number;
}

enum DatasetStatus {
  COLLECTING = 'collecting',
  PROCESSING = 'processing',
  READY = 'ready',
  ARCHIVED = 'archived',
  CORRUPTED = 'corrupted'
}

interface DataQuality {
  completeness: number;
  accuracy: number;
  consistency: number;
  validity: number;
  uniqueness: number;
  timeliness: number;
}
```

### MarketSignal
```typescript
interface MarketSignal {
  id: UUID;
  modelId: UUID;
  symbol: string;
  signalType: MarketSignalType;
  strength: number; // -100 to 100
  direction: 'bullish' | 'bearish' | 'neutral';
  timeframe: string;
  indicators: SignalIndicator[];
  technicalAnalysis: TechnicalAnalysis;
  sentimentAnalysis?: SentimentAnalysis;
  fundamentalAnalysis?: FundamentalAnalysis;
  confidence: number;
  validFrom: DateTime;
  validUntil: DateTime;
  metadata?: Record<string, any>;
  createdAt: DateTime;
}

enum MarketSignalType {
  ENTRY = 'entry',
  EXIT = 'exit',
  TREND_CHANGE = 'trend_change',
  VOLATILITY = 'volatility',
  VOLUME_SPIKE = 'volume_spike',
  BREAKOUT = 'breakout',
  REVERSAL = 'reversal'
}

interface SignalIndicator {
  name: string;
  value: number;
  signal: 'buy' | 'sell' | 'neutral';
  weight: number;
}

interface TechnicalAnalysis {
  rsi?: number;
  macd?: MACDValues;
  movingAverages?: MovingAverages;
  bollingerBands?: BollingerBands;
  support?: number[];
  resistance?: number[];
  trendLine?: TrendLine;
}

interface MACDValues {
  macd: number;
  signal: number;
  histogram: number;
}

interface MovingAverages {
  sma20: number;
  sma50: number;
  sma200: number;
  ema12: number;
  ema26: number;
}

interface BollingerBands {
  upper: number;
  middle: number;
  lower: number;
  width: number;
}

interface TrendLine {
  slope: number;
  intercept: number;
  r2: number;
  direction: 'up' | 'down' | 'sideways';
}

interface SentimentAnalysis {
  score: number; // -1 to 1
  sources: SentimentSource[];
  keywords: string[];
  topics: string[];
}

interface SentimentSource {
  type: 'news' | 'social' | 'analyst';
  name: string;
  score: number;
  weight: number;
  timestamp: DateTime;
}

interface FundamentalAnalysis {
  peRatio?: number;
  pbRatio?: number;
  divYield?: number;
  marketCap?: Decimal;
  revenue?: Decimal;
  earnings?: Decimal;
  debtToEquity?: number;
  roe?: number;
}
```

### AIAgent
```typescript
interface AIAgent {
  id: UUID;
  name: string;
  type: AgentType;
  capabilities: string[];
  llmProvider: LLMProvider;
  llmModel: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  tools: AgentTool[];
  memory: AgentMemory;
  status: AgentStatus;
  metrics: AgentMetrics;
  createdAt: DateTime;
  updatedAt: DateTime;
}

enum AgentType {
  ANALYST = 'analyst',
  TRADER = 'trader',
  RISK_MANAGER = 'risk_manager',
  EDUCATOR = 'educator',
  SUPPORT = 'support',
  CONTENT_CREATOR = 'content_creator'
}

enum LLMProvider {
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  GOOGLE = 'google',
  COHERE = 'cohere',
  HUGGINGFACE = 'huggingface'
}

interface AgentTool {
  name: string;
  description: string;
  endpoint: string;
  parameters: Record<string, any>;
}

interface AgentMemory {
  type: 'conversation' | 'summary' | 'vector';
  maxTokens: number;
  vectorStore?: string;
  retention: number; // days
}

enum AgentStatus {
  ACTIVE = 'active',
  IDLE = 'idle',
  PROCESSING = 'processing',
  ERROR = 'error',
  DISABLED = 'disabled'
}

interface AgentMetrics {
  totalRequests: number;
  avgResponseTime: number;
  successRate: number;
  avgTokensUsed: number;
  totalCost: Decimal;
  lastActiveAt: DateTime;
}
```

### Conversation
```typescript
interface Conversation {
  id: UUID;
  userId: UUID;
  agentId: UUID;
  sessionId: string;
  messages: Message[];
  context: ConversationContext;
  status: ConversationStatus;
  startedAt: DateTime;
  endedAt?: DateTime;
  metadata?: Record<string, any>;
}

interface Message {
  id: UUID;
  role: 'user' | 'assistant' | 'system';
  content: string;
  attachments?: Attachment[];
  toolCalls?: ToolCall[];
  timestamp: DateTime;
  tokens: number;
  cost?: Decimal;
}

interface Attachment {
  type: 'image' | 'file' | 'chart';
  url: string;
  mimeType: string;
  size: number;
}

interface ToolCall {
  toolName: string;
  input: Record<string, any>;
  output: Record<string, any>;
  duration: number;
  status: 'success' | 'failure';
}

interface ConversationContext {
  topic?: string;
  sentiment?: number;
  entities?: string[];
  intents?: string[];
  summary?: string;
}

enum ConversationStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  ABANDONED = 'abandoned'
}
```

## Relationships

- AIModel (1) → Prediction (n)
- AIModel (1) → MarketSignal (n)
- AIModel (1) → Dataset (n)
- AIAgent (1) → Conversation (n)
- User (1) → Conversation (n)
- Conversation (1) → Message (n)
- Dataset (1) → AIModel (n)

## Indexes

### Prediction Table
- INDEX on modelId
- INDEX on userId
- INDEX on status
- INDEX on createdAt
- INDEX on confidence

### MarketSignal Table
- INDEX on modelId
- INDEX on symbol
- INDEX on signalType
- INDEX on validFrom
- COMPOSITE INDEX on (symbol, validFrom)

### Conversation Table
- INDEX on userId
- INDEX on agentId
- INDEX on status
- INDEX on startedAt

### Message Table
- INDEX on conversationId
- INDEX on role
- INDEX on timestamp

## Performance Considerations

1. **Model Serving**
   - Deploy models using TensorFlow Serving or TorchServe
   - Implement model caching and versioning
   - Use GPU acceleration for inference
   - Batch predictions when possible

2. **Data Pipeline**
   - Stream processing with Apache Kafka
   - Feature store for real-time features
   - Data versioning with DVC
   - Distributed training with Ray or Horovod

3. **Storage Optimization**
   - Store embeddings in vector databases (Pinecone, Weaviate)
   - Archive old conversations to cold storage
   - Compress large model artifacts
   - Use columnar storage for analytics

4. **Monitoring**
   - Track model drift and performance degradation
   - Monitor prediction latency and throughput
   - Alert on anomalous predictions
   - A/B testing for model improvements