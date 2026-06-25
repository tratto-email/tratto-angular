import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TRATTO_CONFIG } from './tratto.config';
import { TrattoService } from './tratto.service';
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

const CONFIG = { apiKey: 'tratto_test_key', baseUrl: 'https://api.tratto.email' };

describe('TrattoService', () => {
  let service: TrattoService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: TRATTO_CONFIG, useValue: CONFIG },
        EmailsService,
        ContactsService,
        AudiencesService,
        CampaignsService,
        TemplatesService,
        WebhooksService,
        DomainsService,
        ApiKeysService,
        AnalyticsService,
        FlowsService,
        WorkspaceService,
        TrattoService,
      ],
    });
    service = TestBed.inject(TrattoService);
  });

  it('is created', () => {
    expect(service).toBeTruthy();
  });

  it('exposes EmailsService on .emails', () => {
    expect(service.emails).toBeInstanceOf(EmailsService);
  });

  it('exposes ContactsService on .contacts', () => {
    expect(service.contacts).toBeInstanceOf(ContactsService);
  });

  it('exposes AudiencesService on .audiences', () => {
    expect(service.audiences).toBeInstanceOf(AudiencesService);
  });

  it('exposes CampaignsService on .campaigns', () => {
    expect(service.campaigns).toBeInstanceOf(CampaignsService);
  });

  it('exposes TemplatesService on .templates', () => {
    expect(service.templates).toBeInstanceOf(TemplatesService);
  });

  it('exposes WebhooksService on .webhooks', () => {
    expect(service.webhooks).toBeInstanceOf(WebhooksService);
  });

  it('exposes DomainsService on .domains', () => {
    expect(service.domains).toBeInstanceOf(DomainsService);
  });

  it('exposes ApiKeysService on .apiKeys', () => {
    expect(service.apiKeys).toBeInstanceOf(ApiKeysService);
  });

  it('exposes AnalyticsService on .analytics', () => {
    expect(service.analytics).toBeInstanceOf(AnalyticsService);
  });

  it('exposes FlowsService on .flows', () => {
    expect(service.flows).toBeInstanceOf(FlowsService);
  });

  it('exposes WorkspaceService on .workspace', () => {
    expect(service.workspace).toBeInstanceOf(WorkspaceService);
  });
});
