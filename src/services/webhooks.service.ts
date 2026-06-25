import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseService } from './base.service';
import type {
  Webhook,
  WebhookDelivery,
  CreateWebhookParams,
  ListWebhookDeliveriesParams,
  PaginatedResponse,
} from '../tratto.types';

/** Service for managing webhook endpoints and inspecting delivery history. */
@Injectable()
export class WebhooksService extends BaseService {
  private get url(): string {
    return `${this.apiBaseUrl}/v1/webhooks`;
  }

  /**
   * Register a new webhook endpoint (`POST /v1/webhooks`).
   *
   * The returned `secret` is shown only once — store it securely and use it
   * to verify the `X-Tratto-Signature` header on incoming events.
   *
   * @returns Observable emitting the new webhook `id` and HMAC signing `secret`.
   */
  create(params: CreateWebhookParams): Observable<{ id: string; secret: string }> {
    return this.http
      .post<{ data: { id: string; secret: string } }>(this.url, params, {
        headers: this.authHeaders(),
      })
      .pipe(map((r) => r.data));
  }

  /**
   * List all registered webhooks (`GET /v1/webhooks`).
   * Results are ordered by creation date descending.
   */
  list(): Observable<Webhook[]> {
    return this.http
      .get<{ data: Webhook[] }>(this.url, { headers: this.authHeaders() })
      .pipe(map((r) => r.data));
  }

  /**
   * Delete a webhook endpoint (`DELETE /v1/webhooks/:id`).
   */
  delete(id: string): Observable<void> {
    return this.voidRequest('DELETE', `${this.url}/${id}`);
  }

  /**
   * List delivery attempts for a webhook (`GET /v1/webhooks/:id/deliveries`).
   * Results are ordered by attempt date descending.
   */
  listDeliveries(
    id: string,
    params?: ListWebhookDeliveriesParams,
  ): Observable<PaginatedResponse<WebhookDelivery>> {
    let p = new HttpParams();
    if (params?.after) p = p.set('after', params.after);
    if (params?.limit != null) p = p.set('limit', String(params.limit));
    return this.http.get<PaginatedResponse<WebhookDelivery>>(`${this.url}/${id}/deliveries`, {
      headers: this.authHeaders(),
      params: p,
    });
  }

  /**
   * Send a test event to a webhook endpoint (`POST /v1/webhooks/:id/test`).
   * Useful for verifying connectivity and signature verification logic.
   */
  test(id: string): Observable<{ queued: boolean }> {
    return this.http
      .post<{ data: { queued: boolean } }>(`${this.url}/${id}/test`, {}, {
        headers: this.authHeaders(),
      })
      .pipe(map((r) => r.data));
  }

  /**
   * Rotate the signing secret for a webhook (`POST /v1/webhooks/:id/rotate-secret`).
   * The new secret is returned once — store it securely.
   * Also resets the failure counter and re-enables a disabled webhook.
   */
  rotateSecret(id: string): Observable<{ secret: string }> {
    return this.http
      .post<{ data: { secret: string } }>(`${this.url}/${id}/rotate-secret`, {}, {
        headers: this.authHeaders(),
      })
      .pipe(map((r) => r.data));
  }
}
