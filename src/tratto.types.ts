// Public types for the Tratto REST API v1.
// Each interface mirrors the validated shape returned by the API.

// ── Shared ────────────────────────────────────────────────────────────────────

/** Pagination metadata included in every list response. */
export interface Pagination {
  hasMore: boolean;
  nextCursor: string | null;
}

/** Wrapper returned by every paginated list endpoint. */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

// ── Emails ────────────────────────────────────────────────────────────────────

/** Parameters accepted by `POST /v1/emails`. */
export interface SendEmailParams {
  /** Sender address. Must match a verified domain. Accepts `"Name <addr>"` or plain `"addr"`. */
  from: string;
  /** One or more recipient email addresses. */
  to: string | string[];
  /** Subject line (max 998 characters). */
  subject: string;
  /** HTML body. At least one of `html`, `text`, or `templateId` is required. */
  html?: string;
  /** Plain-text body. At least one of `html`, `text`, or `templateId` is required. */
  text?: string;
  /** Carbon-copy recipients. */
  cc?: string[];
  /** Blind carbon-copy recipients. */
  bcc?: string[];
  /** Reply-to address. */
  replyTo?: string;
  /** ID of a saved template. At least one of `html`, `text`, or `templateId` is required. */
  templateId?: string;
  /** Variables interpolated inside the template. */
  variables?: Record<string, unknown>;
  /** Custom tags for filtering and analytics. */
  tags?: string[];
  /** Schedule the email for a future time. Sends immediately if omitted or in the past. */
  scheduledAt?: Date | string;
  /** Extra SMTP headers forwarded verbatim. */
  headers?: Record<string, string>;
}

/** Query parameters for `GET /v1/emails`. */
export interface ListEmailsParams {
  after?: string;
  limit?: number;
  /** Comma-separated status values, e.g. `"sent,delivered"`. */
  status?: string;
  domainId?: string;
  /** Comma-separated tag names. */
  tags?: string;
  dateFrom?: Date | string;
  dateTo?: Date | string;
}

/** Compact email representation used in list responses. */
export interface EmailSummary {
  id: string;
  from: string;
  to: string[];
  subject: string;
  status: string;
  createdAt: string;
  sentAt: string | null;
  scheduledAt: string | null;
  tags?: string[];
}

/** A single delivery event recorded for an email. */
export interface EmailEvent {
  type: string;
  occurredAt: string;
  data?: Record<string, unknown>;
}

/** Full email detail including body and inline events. */
export interface EmailDetail extends EmailSummary {
  html?: string;
  text?: string;
  cc?: string[];
  bcc?: string[];
  replyTo?: string;
  templateId?: string;
  headers?: Record<string, string>;
  events: EmailEvent[];
}

// ── Contacts ──────────────────────────────────────────────────────────────────

export type ContactStatus = 'subscribed' | 'unsubscribed' | 'bounced' | 'complained';

export interface Contact {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  status: ContactStatus;
  tags: string[];
  customFields: Record<string, unknown>;
  createdAt: string;
}

export interface CreateContactParams {
  email: string;
  firstName?: string;
  lastName?: string;
  status?: ContactStatus;
  tags?: string[];
  customFields?: Record<string, unknown>;
}

export interface UpdateContactParams {
  firstName?: string;
  lastName?: string;
  status?: ContactStatus;
  tags?: string[];
  customFields?: Record<string, unknown>;
}

export interface ListContactsParams {
  status?: ContactStatus;
  audienceId?: string;
  tag?: string;
  after?: string;
  limit?: number;
}

/** Status snapshot of an async CSV import job. */
export interface ImportJobStatus {
  jobId: string;
  status: 'processing' | 'completed' | 'failed';
  totalRows: number;
  processedRows: number;
  failedRows: number;
  errors: string[];
  completedAt: string | null;
}

// ── Audiences ─────────────────────────────────────────────────────────────────

export type AudienceRuleOperator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'array_contains';

export interface AudienceRule {
  field: string;
  operator: AudienceRuleOperator;
  value: string | number | boolean;
}

export interface Audience {
  id: string;
  name: string;
  description: string;
  contactCount: number;
  rules: AudienceRule[];
  createdAt: string;
}

export interface CreateAudienceParams {
  name: string;
  description?: string;
  rules?: AudienceRule[];
}

export interface ListAudiencesParams {
  after?: string;
  limit?: number;
}

export interface AddContactsToAudienceResult {
  added: number;
  alreadyInAudience: number;
  notFound: number;
}

// ── Campaigns ─────────────────────────────────────────────────────────────────

export type CampaignStatus = 'draft' | 'sending' | 'scheduled' | 'paused' | 'completed';

export interface CampaignStats {
  total: number;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
}

export interface Campaign {
  id: string;
  name: string;
  status: CampaignStatus;
  templateId: string;
  audienceId: string;
  fromName: string;
  fromEmail: string;
  subjectA: string;
  subjectB: string | null;
  scheduledAt: string | null;
  sentAt: string | null;
  stats: CampaignStats;
  createdAt: string;
}

export interface CampaignStatsDetail {
  campaignId: string;
  status: CampaignStatus;
  stats: CampaignStats;
  rates: {
    deliveryRate: number;
    openRate: number;
    clickRate: number;
    bounceRate: number;
  };
}

export interface CreateCampaignParams {
  name: string;
  templateId: string;
  audienceId: string;
  fromName: string;
  fromEmail: string;
  subjectA: string;
  /** Optional subject for A/B testing. */
  subjectB?: string;
}

export interface ListCampaignsParams {
  status?: CampaignStatus;
  after?: string;
  limit?: number;
}

export interface SendCampaignParams {
  /** Schedule the campaign for a future date. Omit to send immediately. */
  scheduledAt?: Date | string;
}

// ── Templates ─────────────────────────────────────────────────────────────────

export type TemplateStatus = 'draft' | 'published';

export interface TemplateSummary {
  id: string;
  name: string;
  status: TemplateStatus;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface Template extends TemplateSummary {
  html: string;
}

export interface CreateTemplateParams {
  name: string;
  /** Initial HTML content. Defaults to an empty string. */
  html?: string;
}

export interface UpdateTemplateParams {
  name?: string;
  html?: string;
  status?: TemplateStatus;
}

export interface ListTemplatesParams {
  limit?: number;
  after?: string;
  status?: TemplateStatus;
}

export interface TemplateVersionSummary {
  version: number;
  savedAt: string;
}

export interface TemplateVersion extends TemplateVersionSummary {
  html: string;
}

// ── Webhooks ──────────────────────────────────────────────────────────────────

export type WebhookEventType =
  | 'sent'
  | 'delivered'
  | 'opened'
  | 'clicked'
  | 'bounced'
  | 'complained'
  | 'unsubscribed';

export type WebhookStatus = 'active' | 'disabled';
export type WebhookDeliveryStatus = 'success' | 'failed' | 'scheduled';

export interface Webhook {
  id: string;
  url: string;
  events: WebhookEventType[];
  status: WebhookStatus;
  /** First 12 characters of the signing secret followed by `…`. The full secret is never re-exposed. */
  secretPrefix: string;
  failureCount: number;
  createdAt: string;
}

export interface WebhookDelivery {
  id: string;
  webhookId: string;
  eventType: string;
  status: WebhookDeliveryStatus;
  httpStatus: number | null;
  responseBody: string | null;
  retryCount: number;
  attemptedAt: string;
}

export interface CreateWebhookParams {
  url: string;
  events: WebhookEventType[];
}

export interface ListWebhookDeliveriesParams {
  after?: string;
  limit?: number;
}

// ── Domains ───────────────────────────────────────────────────────────────────

export type DomainStatus = 'pending' | 'verified' | 'failed';

export interface DomainRecord {
  type: string;
  host: string;
  value: string;
  verified: boolean;
}

export interface DomainSummary {
  id: string;
  domain: string;
  status: DomainStatus;
  dkimSelector: string;
  createdAt: string;
  updatedAt: string;
  verifiedAt: string | null;
}

export interface Domain extends DomainSummary {
  records: DomainRecord[];
}

export interface ListDomainsParams {
  after?: string;
  limit?: number;
}

// ── API Keys ──────────────────────────────────────────────────────────────────

export type ApiKeyEnv = 'live' | 'test';

export interface ApiKey {
  id: string;
  name: string;
  /** First 16 characters of the raw key followed by `...`. */
  prefix: string;
  env: ApiKeyEnv;
  permissions: string[];
  createdAt: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
}

export interface ApiKeyCreated extends ApiKey {
  /** Full raw key value — returned only at creation time. Store it securely; it cannot be retrieved again. */
  key: string;
}

export interface CreateApiKeyParams {
  name: string;
  env: ApiKeyEnv;
  permissions: string[];
}

export interface ListApiKeysParams {
  after?: string;
  limit?: number;
}

// ── Analytics ─────────────────────────────────────────────────────────────────

export type AnalyticsPeriod = '7d' | '30d' | '90d';

export interface AnalyticsSummary {
  period: AnalyticsPeriod;
  totalSent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  complained: number;
  /** Percentage: `(delivered / totalSent) * 100`. */
  deliveryRate: number;
  /** Percentage: `(opened / delivered) * 100`. */
  openRate: number;
  /** Percentage: `(clicked / opened) * 100`. */
  clickRate: number;
  /** Percentage: `(bounced / totalSent) * 100`. */
  bounceRate: number;
}

export interface TimeseriesPoint {
  /** ISO date string, e.g. `"2025-06-01"`. */
  date: string;
  sent: number;
  delivered: number;
  opened: number;
  bounced: number;
}

// ── Flows ─────────────────────────────────────────────────────────────────────

export type FlowStatus = 'draft' | 'active' | 'inactive';

export type FlowTriggerType =
  | 'contact_joins_audience'
  | 'contact_tag_added'
  | 'contact_tag_removed'
  | 'email_event'
  | 'manual';

export type FlowStepType =
  | 'send_email'
  | 'wait'
  | 'branch'
  | 'update_contact'
  | 'webhook_call';

export interface FlowTrigger {
  type: FlowTriggerType;
  config: Record<string, string>;
}

export interface FlowStep {
  id: string;
  type: FlowStepType;
  config: Record<string, string>;
}

export interface Flow {
  id: string;
  name: string;
  status: FlowStatus;
  trigger: FlowTrigger;
  steps: FlowStep[];
  enrollments: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFlowParams {
  name: string;
}

export interface UpdateFlowParams {
  name?: string;
  trigger?: FlowTrigger;
  /** Max 20 steps. Cannot be changed while the flow is active — deactivate first. */
  steps?: FlowStep[];
}

export interface ListFlowsParams {
  after?: string;
  limit?: number;
}

// ── Workspace ─────────────────────────────────────────────────────────────────

export type WorkspacePlan = 'free' | 'starter' | 'growth';
export type WorkspaceMemberRole = 'owner' | 'admin' | 'member';
export type WorkspaceLocale = 'it' | 'en';

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  timezone: string;
  locale: WorkspaceLocale;
  plan: WorkspacePlan;
  createdAt: string;
}

export interface WorkspaceMember {
  userId: string;
  email: string;
  displayName: string | null;
  role: WorkspaceMemberRole;
  joinedAt: string;
}

export interface WorkspacePreferences {
  locale: WorkspaceLocale;
  emailNotifications: {
    bounces: boolean;
    weeklyReport: boolean;
    billingAlerts: boolean;
  };
}

export interface UpdateWorkspaceParams {
  name?: string;
  /** URL slug — lowercase letters, digits and hyphens only (2–50 chars). Must be globally unique. */
  slug?: string;
  timezone?: string;
  locale?: WorkspaceLocale;
}

export interface UpdateWorkspacePreferencesParams {
  locale?: WorkspaceLocale;
  emailNotifications?: {
    bounces?: boolean;
    weeklyReport?: boolean;
    billingAlerts?: boolean;
  };
}

export interface InviteMemberParams {
  email: string;
  role: 'admin' | 'member';
}

export interface UpdateMemberParams {
  role: WorkspaceMemberRole;
}
