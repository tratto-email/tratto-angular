import { InjectionToken } from '@angular/core';

/**
 * Configuration options for the Tratto Angular SDK.
 *
 * Provide it once at the root level via {@link provideTratt} (standalone apps)
 * or {@link TrattoModule.forRoot} (NgModule apps).
 */
export interface TrattoConfig {
  /**
   * API key used to authenticate every request.
   * Obtain one at https://app.tratto.email/settings/api-keys.
   * Supports both live (`tratto_live_...`) and test (`tratto_test_...`) keys.
   */
  apiKey: string;
  /**
   * Base URL of the Tratto REST API.
   * @default 'https://api.tratto.email'
   */
  baseUrl?: string;
}

/** DI injection token that holds the {@link TrattoConfig}. */
export const TRATTO_CONFIG = new InjectionToken<TrattoConfig>('TRATTO_CONFIG');
