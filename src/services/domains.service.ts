import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseService } from './base.service';
import type {
  Domain,
  DomainSummary,
  ListDomainsParams,
  PaginatedResponse,
} from '../tratto.types';

/** Service for adding and verifying sender domains. */
@Injectable()
export class DomainsService extends BaseService {
  private readonly url = `${this.apiBaseUrl}/v1/domains`;

  /**
   * Add a domain and generate its DKIM keypair (`POST /v1/domains`).
   * The response contains the DNS records that must be published before calling {@link verify}.
   *
   * @param domain Bare domain name, e.g. `"mail.acme.com"`.
   */
  add(domain: string): Observable<Domain> {
    return this.http
      .post<{ data: Domain }>(this.url, { domain }, { headers: this.authHeaders() })
      .pipe(this.unwrap());
  }

  /**
   * List domains (`GET /v1/domains`).
   * Results are ordered by creation date descending.
   */
  list(params?: ListDomainsParams): Observable<PaginatedResponse<DomainSummary>> {
    return this.http.get<PaginatedResponse<DomainSummary>>(this.url, {
      headers: this.authHeaders(),
      params: this.buildParams({ after: params?.after, limit: params?.limit }),
    });
  }

  /**
   * Get full domain details including DNS records (`GET /v1/domains/:id`).
   */
  get(id: string): Observable<Domain> {
    return this.http
      .get<{ data: Domain }>(`${this.url}/${id}`, { headers: this.authHeaders() })
      .pipe(this.unwrap());
  }

  /**
   * Trigger DNS verification for a domain (`POST /v1/domains/:id/verify`).
   * Checks SPF, DKIM, and DMARC records in real time and updates the domain status.
   * The domain must be `verified` before it can be used as a sender.
   */
  verify(id: string): Observable<Domain> {
    return this.http
      .post<{ data: Domain }>(`${this.url}/${id}/verify`, {}, { headers: this.authHeaders() })
      .pipe(this.unwrap());
  }

  /**
   * Remove a domain and delete its DKIM private key (`DELETE /v1/domains/:id`).
   *
   * @returns Observable emitting the deleted domain `id` and `deletedAt` timestamp.
   */
  delete(id: string): Observable<{ id: string; deletedAt: string }> {
    return this.http
      .delete<{ data: { id: string; deletedAt: string } }>(`${this.url}/${id}`, {
        headers: this.authHeaders(),
      })
      .pipe(this.unwrap());
  }
}
