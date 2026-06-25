import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
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
  private get url(): string {
    return `${this.apiBaseUrl}/v1/campaigns`;
  }

  /**
   * Create a campaign in `draft` status (`POST /v1/campaigns`).
   * Call {@link send} to dispatch it.
   */
  create(params: CreateCampaignParams): Observable<{ id: string }> {
    return this.http
      .post<{ data: { id: string } }>(this.url, params, { headers: this.authHeaders() })
      .pipe(map((r) => r.data));
  }

  /**
   * List campaigns with optional status filter (`GET /v1/campaigns`).
   * Results are ordered by creation date descending.
   */
  list(params?: ListCampaignsParams): Observable<PaginatedResponse<Campaign>> {
    let p = new HttpParams();
    if (params?.status) p = p.set('status', params.status);
    if (params?.after) p = p.set('after', params.after);
    if (params?.limit != null) p = p.set('limit', String(params.limit));
    return this.http.get<PaginatedResponse<Campaign>>(this.url, {
      headers: this.authHeaders(),
      params: p,
    });
  }

  /**
   * Get a single campaign by ID (`GET /v1/campaigns/:id`).
   */
  get(id: string): Observable<Campaign> {
    return this.http
      .get<{ data: Campaign }>(`${this.url}/${id}`, { headers: this.authHeaders() })
      .pipe(map((r) => r.data));
  }

  /**
   * Get delivery statistics for a campaign (`GET /v1/campaigns/:id/stats`).
   */
  getStats(id: string): Observable<CampaignStatsDetail> {
    return this.http
      .get<{ data: CampaignStatsDetail }>(`${this.url}/${id}/stats`, {
        headers: this.authHeaders(),
      })
      .pipe(map((r) => r.data));
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
      .pipe(map((r) => r.data));
  }

  /**
   * Pause a `sending` or `scheduled` campaign (`POST /v1/campaigns/:id/pause`).
   */
  pause(id: string): Observable<{ status: string }> {
    return this.http
      .post<{ data: { status: string } }>(`${this.url}/${id}/pause`, {}, {
        headers: this.authHeaders(),
      })
      .pipe(map((r) => r.data));
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
      .pipe(map((r) => r.data));
  }
}
