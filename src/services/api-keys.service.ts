import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseService } from './base.service';
import type {
  ApiKey,
  ApiKeyCreated,
  CreateApiKeyParams,
  ListApiKeysParams,
  PaginatedResponse,
} from '../tratto.types';

/** Service for creating and revoking API keys. */
@Injectable()
export class ApiKeysService extends BaseService {
  private get url(): string {
    return `${this.apiBaseUrl}/v1/api-keys`;
  }

  /**
   * Create a new API key (`POST /v1/api-keys`).
   *
   * The full raw key in the response is shown **only once** — store it securely.
   *
   * @param params Key name, environment and permission scopes.
   * @param idempotencyKey Optional key to prevent accidental duplicates.
   * @returns Observable emitting the created key including the raw token.
   */
  create(params: CreateApiKeyParams, idempotencyKey?: string): Observable<ApiKeyCreated> {
    const headers = this.authHeaders(
      idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : undefined,
    );
    return this.http
      .post<{ data: ApiKeyCreated }>(this.url, params, { headers })
      .pipe(map((r) => r.data));
  }

  /**
   * List API keys (without the raw token) (`GET /v1/api-keys`).
   * Results are ordered by creation date descending.
   */
  list(params?: ListApiKeysParams): Observable<PaginatedResponse<ApiKey>> {
    let p = new HttpParams();
    if (params?.after) p = p.set('after', params.after);
    if (params?.limit != null) p = p.set('limit', String(params.limit));
    return this.http.get<PaginatedResponse<ApiKey>>(this.url, {
      headers: this.authHeaders(),
      params: p,
    });
  }

  /**
   * Revoke (soft-delete) an API key (`DELETE /v1/api-keys/:id`).
   * Revoked keys are immediately rejected by the API.
   *
   * @returns Observable emitting the key `id` and `revokedAt` timestamp.
   */
  revoke(id: string): Observable<{ id: string; revokedAt: string }> {
    return this.http
      .delete<{ data: { id: string; revokedAt: string } }>(`${this.url}/${id}`, {
        headers: this.authHeaders(),
      })
      .pipe(map((r) => r.data));
  }
}
