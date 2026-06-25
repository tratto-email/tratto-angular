import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
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
  private readonly url = `${this.apiBaseUrl}/v1/contacts`;

  /**
   * Create a single contact (`POST /v1/contacts`).
   * Returns a conflict error if the email address is already registered.
   */
  create(params: CreateContactParams): Observable<{ id: string }> {
    return this.http
      .post<{ data: { id: string } }>(this.url, params, { headers: this.authHeaders() })
      .pipe(this.unwrap());
  }

  /**
   * List contacts with optional filters (`GET /v1/contacts`).
   * Results are ordered by creation date descending.
   */
  list(params?: ListContactsParams): Observable<PaginatedResponse<Contact>> {
    return this.http.get<PaginatedResponse<Contact>>(this.url, {
      headers: this.authHeaders(),
      params: this.buildParams({
        status: params?.status,
        audienceId: params?.audienceId,
        tag: params?.tag,
        after: params?.after,
        limit: params?.limit,
      }),
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
      .pipe(this.unwrap());
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
      .pipe(this.unwrap());
  }

  /**
   * Poll the status of a CSV import job (`GET /v1/contacts/import/:jobId`).
   */
  getImportJob(jobId: string): Observable<ImportJobStatus> {
    return this.http
      .get<{ data: ImportJobStatus }>(`${this.url}/import/${jobId}`, {
        headers: this.authHeaders(),
      })
      .pipe(this.unwrap());
  }
}
