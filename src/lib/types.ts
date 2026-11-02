export type Fields = {
  nombre?: string;
  email?: string;
  telefono?: string;
  condicion?: string;
};
export type Contact = {
  id: string;
  pipelineStage: string;
  fields: Fields;
  createdAt: string;
  updatedAt: string;
  protectedFields: string[];
};
export type Conversation = {
  id: string;
  contactId: string;
  mode: "bot" | "esperando_humano" | "humano" | "cerrada";
  createdAt: string;
  updatedAt: string;
  summary: Record<string, unknown>;
  summaryThrough: number;
};
export type Message = {
  id: string;
  role: "user" | "assistant" | "operator";
  text: string;
  sequence: number;
  createdAt: string;
  recordIds: string[];
  clientMessageId?: string;
};
export type Turn = {
  id: string;
  status: "encolado" | "procesando" | "completado" | "cancelado" | "fallido";
  attempts: number;
  failure_code: string | null;
  created_at: string;
};
export type Interest = {
  id: string;
  contactId: string;
  data: {
    propuesta_id?: string;
    propuesta_libre?: string;
    sede?: string;
    modalidad?: string;
    periodo?: string;
  };
  stage: string;
  protectedFields: boolean;
};
export type Note = {
  id: string;
  text: string;
  author: string;
  createdAt: string;
};
export type Task = {
  id: string;
  contactId: string;
  text: string;
  dueAt: string;
  status: "pendiente" | "completada" | "cancelada";
};
export type Subscription = {
  id: string;
  contactId: string;
  proposalId: string;
  status: "activa" | "cancelada";
};
export type Notice = {
  id: string;
  contactId: string;
  eventId: string;
  text: string;
  createdAt: string;
  simulated: true;
};
export type AttentionCase = {
  id: string;
  conversationId: string;
  area: string;
  reason: string;
  summary: string;
  status: string;
};
export type Opening = {
  id: string;
  proposalId: string;
  description: string;
  status: string;
  result?: { data?: { generados: number; omitidos: number } };
};
export type Proposal = { id: string; titulo: string; seccion: string };
export type Status = {
  knowledge_version: string;
  knowledge_hash: string;
  records: number;
  dispatch_enabled: boolean;
  n8n_configured: boolean;
  n8n_live_verified: boolean;
};
export type Directory = {
  contacts: Contact[];
  interests: Interest[];
  conversations: Conversation[];
};
export type ConversationDetail = {
  conversation: Conversation;
  contact: Contact;
  messages: Message[];
  turns: Turn[];
  cases: AttentionCase[];
};
export type Profile = {
  contact: Contact;
  interests: Interest[];
  notes: Note[];
  tasks: Task[];
  subscriptions: Subscription[];
  notices: Notice[];
};
export type Followup = {
  automations?: {
    id: string;
    contactId: string;
    conversationId: string;
    status: string;
    sentCount: number;
    dueAt: string | null;
    reason: string | null;
  }[];
  tasks: Task[];
  subscriptions: Subscription[];
  events: Opening[];
  notices: Notice[];
  cases: AttentionCase[];
};
export type KnowledgeRecord = {
  id: string;
  title: string;
  period: string | null;
  conditions: string[];
  sources: { title: string; url: string }[];
};
export type Mutation = (
  path: string,
  body: unknown,
  method?: "POST" | "PATCH",
  success?: string,
) => Promise<unknown>;
