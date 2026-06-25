import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseService } from './base.service';
import type {
  Campaign,
  CampaignStatsDetail,
  CreateCampaignParams,
  ListCampaignsParams,
  SendCampaignParams,
  PaginatedResponse,
} from '../tratto.types';

/** Service for managing and sending email campaigns. */
@Injectable()
export class CampaignsService extends BaseService {
  private readonly url = `${this.apiBaseUrl}/v1/campaigns`;

  /**
   * Create a campaign in `draft` status (`POST /v1/campaigns`).
   * Call {@link send} to dispatch it.
   */
  create(params: CreateCampaignParams): Observable<{ id: string }> {
    return this.http
      .post<{ data: { id: string } }>(this.url, params, { headers: this.authHeaders() })
      .pipe(this.unwrap());
  }

  /**
   * List campaigns with optional status filter (`GET /v1/campaigns`).
   * Results are ordered by creation date descending.
   */
  list(params?: ListCampaignsParams): Observable<PaginatedResponse<Campaign>> {
    return this.http.get<PaginatedResponse<Campaign>>(this.url, {
      headers: this.authHeaders(),
      params: this.buildParams({ status: params?.status, after: params?.after, limit: params?.limit }),
    });
  }

  /**
   * Get a single campaign by ID (`GET /v1/campaigns/:id`).
   */
  get(id: string): Observable<Campaign> {
    return this.http
      .get<{ data: Campaign }>(`${this.url}/${id}`, { headers: this.authHeaders() })
      .pipe(this.unwrap());
  }

  /**
   * Get delivery statistics for a campaign (`GET /v1/campaigns/:id/stats`).
   */
  getStats(id: string): Observable<CampaignStatsDetail> {
    return this.http
      .get<{ data: CampaignStatsDetail }>(`${this.url}/${id}/stats`, {
        headers: this.authHeaders(),
      })
      .pipe(this.unwrap());
  }

  /**
   * Send or schedule a campaign (`POST /v1/campaigns/:id/send`).
   * Only `draft` or `paused` campaigns can be sent.
   *
   * @param id Campaign ID.
   * @param params Optional `scheduledAt` to defer sending.
   * @returns Observable emitting the new campaign status.
   */
  send(id: string, params?: SendCampaignParams): Observable<{ status: string }> {
    const body: Record<string, unknown> = {};
    if (params?.scheduledAt) {
      body['scheduledAt'] =
        params.scheduledAt instanceof Date
          ? params.scheduledAt.toISOString()
          : params.scheduledAt;
    }
    return this.http
      .post<{ data: { status: string } }>(`${this.url}/${id}/send`, body, {
        headers: this.authHeaders(),
      })
      .pipe(this.unwrap());
  }

  /**
   * Pause a `sending` or `scheduled` campaign (`POST /v1/campaigns/:id/pause`).
   */
  pause(id: string): Observable<{ status: string }> {
    return this.http
      .post<{ data: { status: string } }>(`${this.url}/${id}/pause`, {}, {
        headers: this.authHeaders(),
      })
      .pipe(this.unwrap());
  }

  /**
   * Send a test email for this campaign to a specific address
   * (`POST /v1/campaigns/:id/test-send`).
   *
   * @param id Campaign ID.
   * @param to Recipient email address for the test.
   * @returns Observable emitting the created test email ID.
   */
  testSend(id: string, to: string): Observable<{ emailId: string }> {
    return this.http
      .post<{ data: { emailId: string } }>(`${this.url}/${id}/test-send`, { to }, {
        headers: this.authHeaders(),
      })
      .pipe(this.unwrap());
  }
}
