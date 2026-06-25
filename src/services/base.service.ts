import { inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, OperatorFunction } from 'rxjs';
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
  protected readonly apiBaseUrl = (
    this.config.baseUrl ?? 'https://api.tratto.email'
  ).replace(/\/$/, '');

  /**
   * Returns an `HttpHeaders` instance pre-populated with the `Authorization` header.
   * Pass `extra` to merge additional headers (e.g. `Idempotency-Key`).
   */
  protected authHeaders(extra?: Record<string, string>): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.config.apiKey}`, ...extra });
  }

  /**
   * Builds an `HttpParams` object from a plain object, skipping `null`/`undefined` values.
   * `Date` values are serialised to ISO strings.
   */
  protected buildParams(
    params: Record<string, string | number | boolean | Date | null | undefined>,
  ): HttpParams {
    return Object.entries(params).reduce((p, [key, val]) => {
      if (val == null) return p;
      if (val instanceof Date) return p.set(key, val.toISOString());
      return p.set(key, String(val));
    }, new HttpParams());
  }

  /**
   * RxJS operator that unwraps the `{ data: T }` envelope returned by every
   * Tratto API endpoint.
   */
  protected unwrap<T>(): OperatorFunction<{ data: T }, T> {
    return map((r) => r.data);
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
