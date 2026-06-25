import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
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
  private readonly url = `${this.apiBaseUrl}/v1/audiences`;

  /**
   * Create an audience (`POST /v1/audiences`).
   * Optionally supply filter `rules` to make it a dynamic segment.
   */
  create(params: CreateAudienceParams): Observable<{ id: string }> {
    return this.http
      .post<{ data: { id: string } }>(this.url, params, { headers: this.authHeaders() })
      .pipe(this.unwrap());
  }

  /**
   * List audiences (`GET /v1/audiences`).
   * Results are ordered by creation date descending.
   */
  list(params?: ListAudiencesParams): Observable<PaginatedResponse<Audience>> {
    return this.http.get<PaginatedResponse<Audience>>(this.url, {
      headers: this.authHeaders(),
      params: this.buildParams({ after: params?.after, limit: params?.limit }),
    });
  }

  /**
   * Get a single audience by ID (`GET /v1/audiences/:id`).
   */
  get(id: string): Observable<Audience> {
    return this.http
      .get<{ data: Audience }>(`${this.url}/${id}`, { headers: this.authHeaders() })
      .pipe(this.unwrap());
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
      .pipe(this.unwrap());
  }
}
