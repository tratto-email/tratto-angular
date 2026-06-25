import { NgModule, ModuleWithProviders, EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { TRATTO_CONFIG } from './tratto.config';
import type { TrattoConfig } from './tratto.config';
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

/** All injectable services exported by this SDK. */
const TRATTO_PROVIDERS = [
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
];

/**
 * Provides all Tratto services for **standalone** Angular applications.
 *
 * Add this to your `ApplicationConfig` providers array alongside
 * `provideHttpClient()`. The SDK uses `HttpClient` internally; if your app
 * has not already provided it, include `provideHttpClient()` as well.
 *
 * @example
 * ```ts
 * // app.config.ts
 * import { provideHttpClient } from '@angular/common/http';
 * import { provideTratt } from '@tratto/angular';
 *
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideHttpClient(),
 *     provideTratt({ apiKey: 'tratto_live_...' }),
 *   ],
 * };
 * ```
 */
export function provideTratt(config: TrattoConfig): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: TRATTO_CONFIG, useValue: config },
    ...TRATTO_PROVIDERS,
  ]);
}

/**
 * Angular module that registers all Tratto services.
 *
 * For Angular 14+ **standalone** applications prefer {@link provideTratt}.
 * For **NgModule**-based applications use `TrattoModule.forRoot()`.
 *
 * > **Note:** `HttpClientModule` (or `provideHttpClient()`) must be imported
 * > in your application before importing `TrattoModule`.
 *
 * @example
 * ```ts
 * // app.module.ts
 * import { HttpClientModule } from '@angular/common/http';
 * import { TrattoModule } from '@tratto/angular';
 *
 * @NgModule({
 *   imports: [
 *     HttpClientModule,
 *     TrattoModule.forRoot({ apiKey: 'tratto_live_...' }),
 *   ],
 * })
 * export class AppModule {}
 * ```
 */
@NgModule({})
export class TrattoModule {
  static forRoot(config: TrattoConfig): ModuleWithProviders<TrattoModule> {
    return {
      ngModule: TrattoModule,
      providers: [
        { provide: TRATTO_CONFIG, useValue: config },
        ...TRATTO_PROVIDERS,
      ],
    };
  }
}
