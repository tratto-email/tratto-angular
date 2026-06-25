import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseService } from './base.service';
import type {
  SendEmailParams,
  EmailSummary,
  EmailDetail,
  EmailEvent,
  ListEmailsParams,
  PaginatedResponse,
} from '../tratto.types';

/** Service for sending transactional emails and inspecting their delivery. */
@Injectable()
export class EmailsService extends BaseService {
  private get url(): string {
    return `${this.apiBaseUrl}/v1/emails`;
  }

  /**
   * Send a transactional email (`POST /v1/emails`).
   * At least one of `html`, `text`, or `templateId` is required.
   *
   * @param params Email parameters.
   * @param idempotencyKey Optional key that guarantees exactly-once delivery.
   *   If the same key is re-used within 24 hours the original response is returned.
   * @returns Observable that emits the created email `id`.
   */
  send(params: SendEmailParams, idempotencyKey?: string): Observable<{ id: string }> {
    const headers = this.authHeaders(
      idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : undefined,
    );
    return this.http
      .post<{ data: { id: string } }>(this.url, params, { headers })
      .pipe(map((r) => r.data));
  }

  /**
   * List emails with optional filters (`GET /v1/emails`).
   * Results are ordered by creation date descending.
   */
  list(params?: ListEmailsParams): Observable<PaginatedResponse<EmailSummary>> {
    let p = new HttpParams();
    if (params?.after) p = p.set('after', params.after);
    if (params?.limit != null) p = p.set('limit', String(params.limit));
    if (params?.status) p = p.set('status', params.status);
    if (params?.domainId) p = p.set('domainId', params.domainId);
    if (params?.tags) p = p.set('tags', params.tags);
    if (params?.dateFrom) {
      p = p.set(
        'dateFrom',
        params.dateFrom instanceof Date ? params.dateFrom.toISOString() : params.dateFrom,
      );
    }
    if (params?.dateTo) {
      p = p.set(
        'dateTo',
        params.dateTo instanceof Date ? params.dateTo.toISOString() : params.dateTo,
      );
    }
    return this.http.get<PaginatedResponse<EmailSummary>>(this.url, {
      headers: this.authHeaders(),
      params: p,
    });
  }

  /**
   * Get a single email with full details and inline events (`GET /v1/emails/:id`).
   */
  get(id: string): Observable<EmailDetail> {
    return this.http
      .get<{ data: EmailDetail }>(`${this.url}/${id}`, { headers: this.authHeaders() })
      .pipe(map((r) => r.data));
  }

  /**
   * List all delivery events for a specific email (`GET /v1/emails/:id/events`).
   */
  listEvents(id: string): Observable<EmailEvent[]> {
    return this.http
      .get<{ data: EmailEvent[] }>(`${this.url}/${id}/events`, { headers: this.authHeaders() })
      .pipe(map((r) => r.data));
  }
}
