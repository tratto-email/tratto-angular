import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseService } from './base.service';
import type {
  Flow,
  CreateFlowParams,
  UpdateFlowParams,
  ListFlowsParams,
  PaginatedResponse,
} from '../tratto.types';

/** Service for managing email automation flows. */
@Injectable()
export class FlowsService extends BaseService {
  private get url(): string {
    return `${this.apiBaseUrl}/v1/flows`;
  }

  /**
   * List automation flows (`GET /v1/flows`).
   * Results are ordered by creation date descending.
   */
  list(params?: ListFlowsParams): Observable<PaginatedResponse<Flow>> {
    let p = new HttpParams();
    if (params?.after) p = p.set('after', params.after);
    if (params?.limit != null) p = p.set('limit', String(params.limit));
    return this.http.get<PaginatedResponse<Flow>>(this.url, {
      headers: this.authHeaders(),
      params: p,
    });
  }

  /**
   * Create a flow in `draft` status (`POST /v1/flows`).
   * Configure the trigger and steps via {@link update} before activating.
   */
  create(params: CreateFlowParams): Observable<{ id: string }> {
    return this.http
      .post<{ data: { id: string } }>(this.url, params, { headers: this.authHeaders() })
      .pipe(map((r) => r.data));
  }

  /**
   * Get a single flow by ID (`GET /v1/flows/:id`).
   */
  get(id: string): Observable<Flow> {
    return this.http
      .get<{ data: Flow }>(`${this.url}/${id}`, { headers: this.authHeaders() })
      .pipe(map((r) => r.data));
  }

  /**
   * Update a flow's name, trigger, or steps (`PATCH /v1/flows/:id`).
   * Steps cannot be changed while the flow is active — call {@link deactivate} first.
   */
  update(id: string, params: UpdateFlowParams): Observable<Flow> {
    return this.http
      .patch<{ data: Flow }>(`${this.url}/${id}`, params, { headers: this.authHeaders() })
      .pipe(map((r) => r.data));
  }

  /**
   * Delete a flow (`DELETE /v1/flows/:id`).
   * Only `draft` or `inactive` flows can be deleted.
   */
  delete(id: string): Observable<{ id: string }> {
    return this.http
      .delete<{ data: { id: string } }>(`${this.url}/${id}`, { headers: this.authHeaders() })
      .pipe(map((r) => r.data));
  }

  /**
   * Activate a flow, enabling it to enroll contacts (`POST /v1/flows/:id/activate`).
   */
  activate(id: string): Observable<Flow> {
    return this.http
      .post<{ data: Flow }>(`${this.url}/${id}/activate`, {}, { headers: this.authHeaders() })
      .pipe(map((r) => r.data));
  }

  /**
   * Deactivate a flow (`POST /v1/flows/:id/deactivate`).
   * Contacts already enrolled continue through their current steps.
   * No new enrollments are accepted until the flow is re-activated.
   */
  deactivate(id: string): Observable<Flow> {
    return this.http
      .post<{ data: Flow }>(`${this.url}/${id}/deactivate`, {}, { headers: this.authHeaders() })
      .pipe(map((r) => r.data));
  }
}
