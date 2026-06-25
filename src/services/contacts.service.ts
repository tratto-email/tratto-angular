import { Injectable } from '@angular/core';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseService } from './base.service';
import type {
  Contact,
  CreateContactParams,
  UpdateContactParams,
  ListContactsParams,
  ImportJobStatus,
  PaginatedResponse,
} from '../tratto.types';

/** Service for managing contacts and running CSV imports. */
@Injectable()
export class ContactsService extends BaseService {
  private get url(): string {
    return `${this.apiBaseUrl}/v1/contacts`;
  }

  /**
   * Create a single contact (`POST /v1/contacts`).
   * Returns a conflict error if the email address is already registered.
   */
  create(params: CreateContactParams): Observable<{ id: string }> {
    return this.http
      .post<{ data: { id: string } }>(this.url, params, { headers: this.authHeaders() })
      .pipe(map((r) => r.data));
  }

  /**
   * List contacts with optional filters (`GET /v1/contacts`).
   * Results are ordered by creation date descending.
   */
  list(params?: ListContactsParams): Observable<PaginatedResponse<Contact>> {
    let p = new HttpParams();
    if (params?.status) p = p.set('status', params.status);
    if (params?.audienceId) p = p.set('audienceId', params.audienceId);
    if (params?.tag) p = p.set('tag', params.tag);
    if (params?.after) p = p.set('after', params.after);
    if (params?.limit != null) p = p.set('limit', String(params.limit));
    return this.http.get<PaginatedResponse<Contact>>(this.url, {
      headers: this.authHeaders(),
      params: p,
    });
  }

  /**
   * Update a contact's details (`PATCH /v1/contacts/:id`).
   * Only supplied fields are updated.
   */
  update(id: string, params: UpdateContactParams): Observable<{ id: string }> {
    return this.http
      .patch<{ data: { id: string } }>(`${this.url}/${id}`, params, {
        headers: this.authHeaders(),
      })
      .pipe(map((r) => r.data));
  }

  /**
   * Start an asynchronous CSV import job (`POST /v1/contacts/import`).
   *
   * The CSV must have an `email` column. Optional columns:
   * `first_name` / `firstname`, `last_name` / `lastname`, `status`,
   * `tags` (semicolon-separated values).
   *
   * Maximum 50 000 rows per import. Poll {@link getImportJob} to track progress.
   *
   * @returns Observable that emits the new `jobId` and total row count.
   */
  importCsv(csvText: string): Observable<{ jobId: string; totalRows: number }> {
    return this.http
      .post<{ data: { jobId: string; totalRows: number } }>(
        `${this.url}/import`,
        csvText,
        {
          headers: new HttpHeaders({
            Authorization: `Bearer ${this.config.apiKey}`,
            'Content-Type': 'text/csv',
          }),
        },
      )
      .pipe(map((r) => r.data));
  }

  /**
   * Poll the status of a CSV import job (`GET /v1/contacts/import/:jobId`).
   */
  getImportJob(jobId: string): Observable<ImportJobStatus> {
    return this.http
      .get<{ data: ImportJobStatus }>(`${this.url}/import/${jobId}`, {
        headers: this.authHeaders(),
      })
      .pipe(map((r) => r.data));
  }
}
