// ── Configuration ─────────────────────────────────────────────────────────────
export { TrattoConfig, TRATTO_CONFIG } from './tratto.config';

// ── Module & standalone provider ──────────────────────────────────────────────
export { TrattoModule, provideTratt } from './tratto.module';

// ── Facade service ────────────────────────────────────────────────────────────
export { TrattoService } from './tratto.service';

// ── Resource services ─────────────────────────────────────────────────────────
export { EmailsService } from './services/emails.service';
export { ContactsService } from './services/contacts.service';
export { AudiencesService } from './services/audiences.service';
export { CampaignsService } from './services/campaigns.service';
export { TemplatesService } from './services/templates.service';
export { WebhooksService } from './services/webhooks.service';
export { DomainsService } from './services/domains.service';
export { ApiKeysService } from './services/api-keys.service';
export { AnalyticsService } from './services/analytics.service';
export { FlowsService } from './services/flows.service';
export { WorkspaceService } from './services/workspace.service';

// ── Types ─────────────────────────────────────────────────────────────────────
export type {
  // Shared
  Pagination,
  PaginatedResponse,
  // Emails
  SendEmailParams,
  ListEmailsParams,
  EmailSummary,
  EmailEvent,
  EmailDetail,
  // Contacts
  ContactStatus,
  Contact,
  CreateContactParams,
  UpdateContactParams,
  ListContactsParams,
  ImportJobStatus,
  // Audiences
  AudienceRuleOperator,
  AudienceRule,
  Audience,
  CreateAudienceParams,
  ListAudiencesParams,
  AddContactsToAudienceResult,
  // Campaigns
  CampaignStatus,
  CampaignStats,
  Campaign,
  CampaignStatsDetail,
  CreateCampaignParams,
  ListCampaignsParams,
  SendCampaignParams,
  // Templates
  TemplateStatus,
  TemplateSummary,
  Template,
  CreateTemplateParams,
  UpdateTemplateParams,
  ListTemplatesParams,
  TemplateVersionSummary,
  TemplateVersion,
  // Webhooks
  WebhookEventType,
  WebhookStatus,
  WebhookDeliveryStatus,
  Webhook,
  WebhookDelivery,
  CreateWebhookParams,
  ListWebhookDeliveriesParams,
  // Domains
  DomainStatus,
  DomainRecord,
  DomainSummary,
  Domain,
  ListDomainsParams,
  // API Keys
  ApiKeyEnv,
  ApiKey,
  ApiKeyCreated,
  CreateApiKeyParams,
  ListApiKeysParams,
  // Analytics
  AnalyticsPeriod,
  AnalyticsSummary,
  TimeseriesPoint,
  // Flows
  FlowStatus,
  FlowTriggerType,
  FlowStepType,
  FlowTrigger,
  FlowStep,
  Flow,
  CreateFlowParams,
  UpdateFlowParams,
  ListFlowsParams,
  // Workspace
  WorkspacePlan,
  WorkspaceMemberRole,
  WorkspaceLocale,
  Workspace,
  WorkspaceMember,
  WorkspacePreferences,
  UpdateWorkspaceParams,
  UpdateWorkspacePreferencesParams,
  InviteMemberParams,
  UpdateMemberParams,
} from './tratto.types';
