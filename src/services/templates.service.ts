import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseService } from './base.service';
import type {
  Template,
  TemplateSummary,
  TemplateVersion,
  TemplateVersionSummary,
  CreateTemplateParams,
  UpdateTemplateParams,
  ListTemplatesParams,
  PaginatedResponse,
} from '../tratto.types';

/** Service for managing email templates and their version history. */
@Injectable()
export class TemplatesService extends BaseService {
  private get url(): string {
    return `${this.apiBaseUrl}/v1/templates`;
  }

  /**
   * List templates (`GET /v1/templates`).
   * Results are ordered by creation date descending.
   */
  list(params?: ListTemplatesParams): Observable<PaginatedResponse<TemplateSummary>> {
    let p = new HttpParams();
    if (params?.limit != null) p = p.set('limit', String(params.limit));
    if (params?.after) p = p.set('after', params.after);
    if (params?.status) p = p.set('status', params.status);
    return this.http.get<PaginatedResponse<TemplateSummary>>(this.url, {
      headers: this.authHeaders(),
      params: p,
    });
  }

  /**
   * Create a new template (`POST /v1/templates`).
   * The template starts in `draft` status.
   */
  create(params: CreateTemplateParams): Observable<Template> {
    return this.http
      .post<{ data: Template }>(this.url, params, { headers: this.authHeaders() })
      .pipe(map((r) => r.data));
  }

  /**
   * Get a single template by ID (`GET /v1/templates/:id`).
   */
  get(id: string): Observable<Template> {
    return this.http
      .get<{ data: Template }>(`${this.url}/${id}`, { headers: this.authHeaders() })
      .pipe(map((r) => r.data));
  }

  /**
   * Update a template's name, HTML, or status (`PATCH /v1/templates/:id`).
   * Changing `html` automatically creates a new version entry.
   */
  update(id: string, params: UpdateTemplateParams): Observable<Template> {
    return this.http
      .patch<{ data: Template }>(`${this.url}/${id}`, params, { headers: this.authHeaders() })
      .pipe(map((r) => r.data));
  }

  /**
   * Permanently delete a template (`DELETE /v1/templates/:id`).
   */
  delete(id: string): Observable<void> {
    return this.voidRequest('DELETE', `${this.url}/${id}`);
  }

  /**
   * List the version history of a template (`GET /v1/templates/:id/versions`).
   * Returns up to the 20 most recent versions, newest first.
   */
  listVersions(id: string): Observable<TemplateVersionSummary[]> {
    return this.http
      .get<{ data: TemplateVersionSummary[] }>(`${this.url}/${id}/versions`, {
        headers: this.authHeaders(),
      })
      .pipe(map((r) => r.data));
  }

  /**
   * Get the HTML of a specific template version (`GET /v1/templates/:id/versions/:version`).
   */
  getVersion(id: string, version: number): Observable<TemplateVersion> {
    return this.http
      .get<{ data: TemplateVersion }>(`${this.url}/${id}/versions/${version}`, {
        headers: this.authHeaders(),
      })
      .pipe(map((r) => r.data));
  }

  /**
   * Send a test email using this template (`POST /v1/templates/:id/test-send`).
   *
   * @param id Template ID.
   * @param to Recipient address for the test.
   * @param variables Variables to substitute inside the template.
   */
  testSend(
    id: string,
    to: string,
    variables: Record<string, string> = {},
  ): Observable<{ queued: boolean }> {
    return this.http
      .post<{ data: { queued: boolean } }>(
        `${this.url}/${id}/test-send`,
        { to, variables },
        { headers: this.authHeaders() },
      )
      .pipe(map((r) => r.data));
  }
}
