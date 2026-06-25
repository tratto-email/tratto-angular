import { Injectable, inject } from '@angular/core';
import { EmailsService } from './services/emails.service';
import { ContactsService } from './services/contacts.service';
import { AudiencesService } from './services/audiences.service';
import { CampaignsService } from './services/campaigns.service';
import { TemplatesService } from './services/templates.service';
import { WebhooksService } from './services/webhooks.service';
import { DomainsService } from './services/domains.service';
import { ApiKeysService } from './services/api-keys.service';
import { AnalyticsService } from './services/analytics.service';
import { FlowsService } from './services/flows.service';
import { WorkspaceService } from './services/workspace.service';

/**
 * Top-level facade that aggregates all Tratto resource services.
 *
 * Inject `TrattoService` for a single entry-point into the SDK, or inject
 * individual resource services (e.g. `EmailsService`) directly for
 * better tree-shaking in large applications.
 *
 * @example
 * ```ts
 * // app.component.ts
 * export class AppComponent {
 *   private tratto = inject(TrattoService);
 *
 *   sendWelcome() {
 *     this.tratto.emails
 *       .send({ from: 'hello@acme.com', to: 'user@example.com', subject: 'Welcome!' })
 *       .subscribe(({ id }) => console.log('Sent:', id));
 *   }
 * }
 * ```
 */
@Injectable()
export class TrattoService {
  /** Access email sending and inspection methods. */
  readonly emails = inject(EmailsService);
  /** Access contact management and CSV import methods. */
  readonly contacts = inject(ContactsService);
  /** Access audience creation and membership methods. */
  readonly audiences = inject(AudiencesService);
  /** Access campaign creation, scheduling, and statistics methods. */
  readonly campaigns = inject(CampaignsService);
  /** Access template CRUD and version history methods. */
  readonly templates = inject(TemplatesService);
  /** Access webhook registration and delivery history methods. */
  readonly webhooks = inject(WebhooksService);
  /** Access domain onboarding and DNS verification methods. */
  readonly domains = inject(DomainsService);
  /** Access API key creation and revocation methods. */
  readonly apiKeys = inject(ApiKeysService);
  /** Access email analytics summary and time-series methods. */
  readonly analytics = inject(AnalyticsService);
  /** Access automation flow management methods. */
  readonly flows = inject(FlowsService);
  /** Access workspace settings and team member methods. */
  readonly workspace = inject(WorkspaceService);
}
