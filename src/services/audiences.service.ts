import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseService } from './base.service';
import type {
  Audience,
  CreateAudienceParams,
  ListAudiencesParams,
  AddContactsToAudienceResult,
  PaginatedResponse,
} from '../tratto.types';

/** Service for managing contact audiences. */
@Injectable()
export class AudiencesService extends BaseService {
  private get url(): string {
    return `${this.apiBaseUrl}/v1/audiences`;
  }

  /**
   * Create an audience (`POST /v1/audiences`).
   * Optionally supply filter `rules` to make it a dynamic segment.
   */
  create(params: CreateAudienceParams): Observable<{ id: string }> {
    return this.http
      .post<{ data: { id: string } }>(this.url, params, { headers: this.authHeaders() })
      .pipe(map((r) => r.data));
  }

  /**
   * List audiences (`GET /v1/audiences`).
   * Results are ordered by creation date descending.
   */
  list(params?: ListAudiencesParams): Observable<PaginatedResponse<Audience>> {
    let p = new HttpParams();
    if (params?.after) p = p.set('after', params.after);
    if (params?.limit != null) p = p.set('limit', String(params.limit));
    return this.http.get<PaginatedResponse<Audience>>(this.url, {
      headers: this.authHeaders(),
      params: p,
    });
  }

  /**
   * Get a single audience by ID (`GET /v1/audiences/:id`).
   */
  get(id: string): Observable<Audience> {
    return this.http
      .get<{ data: Audience }>(`${this.url}/${id}`, { headers: this.authHeaders() })
      .pipe(map((r) => r.data));
  }

  /**
   * Add contacts to an audience (`POST /v1/audiences/:id/contacts`).
   * Accepts up to 500 contact IDs per call.
   */
  addContacts(
    audienceId: string,
    contactIds: string[],
  ): Observable<AddContactsToAudienceResult> {
    return this.http
      .post<{ data: AddContactsToAudienceResult }>(
        `${this.url}/${audienceId}/contacts`,
        { contactIds },
        { headers: this.authHeaders() },
      )
      .pipe(map((r) => r.data));
  }
}
