import { inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TRATTO_CONFIG } from '../tratto.config';

/**
 * Abstract base class shared by all Tratto resource services.
 * Provides the `HttpClient`, config injection, and auth-header helpers.
 */
export abstract class BaseService {
  protected readonly http = inject(HttpClient);
  protected readonly config = inject(TRATTO_CONFIG);

  /** Root API URL without trailing slash (e.g. `https://api.tratto.email`). */
  protected get apiBaseUrl(): string {
    return (this.config.baseUrl ?? 'https://api.tratto.email').replace(/\/$/, '');
  }

  /**
   * Returns an `HttpHeaders` instance pre-populated with the `Authorization` header.
   * Pass `extra` to merge additional headers (e.g. `Idempotency-Key`).
   */
  protected authHeaders(extra?: Record<string, string>): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.config.apiKey}`, ...extra });
  }

  /**
   * Sends a DELETE/PATCH/POST that returns HTTP 204 (no body).
   * Uses `responseType: 'text'` to avoid JSON-parse errors on an empty body.
   */
  protected voidRequest(
    method: 'DELETE' | 'PATCH' | 'POST',
    url: string,
    body?: unknown,
  ): Observable<void> {
    return this.http
      .request(method, url, {
        headers: this.authHeaders(),
        responseType: 'text',
        ...(body !== undefined ? { body } : {}),
      })
      .pipe(map(() => void 0));
  }
}
