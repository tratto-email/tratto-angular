import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
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
  private readonly url = `${this.apiBaseUrl}/v1/api-keys`;

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
      .pipe(this.unwrap());
  }

  /**
   * List API keys (without the raw token) (`GET /v1/api-keys`).
   * Results are ordered by creation date descending.
   */
  list(params?: ListApiKeysParams): Observable<PaginatedResponse<ApiKey>> {
    return this.http.get<PaginatedResponse<ApiKey>>(this.url, {
      headers: this.authHeaders(),
      params: this.buildParams({ after: params?.after, limit: params?.limit }),
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
      .pipe(this.unwrap());
  }
}
