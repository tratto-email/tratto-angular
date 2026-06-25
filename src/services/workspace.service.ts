import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseService } from './base.service';
import type {
  Workspace,
  WorkspaceMember,
  WorkspacePreferences,
  UpdateWorkspaceParams,
  UpdateWorkspacePreferencesParams,
  InviteMemberParams,
  UpdateMemberParams,
} from '../tratto.types';

/** Service for managing workspace settings and team members. */
@Injectable()
export class WorkspaceService extends BaseService {
  private readonly url = `${this.apiBaseUrl}/v1/workspace`;

  /**
   * Get the current workspace (`GET /v1/workspace`).
   * Creates a workspace with default settings on first access if none exists.
   */
  get(): Observable<Workspace> {
    return this.http
      .get<{ data: Workspace }>(this.url, { headers: this.authHeaders() })
      .pipe(this.unwrap());
  }

  /**
   * Update workspace settings (`PATCH /v1/workspace`).
   * Only supplied fields are changed.
   */
  update(params: UpdateWorkspaceParams): Observable<Workspace> {
    return this.http
      .patch<{ data: Workspace }>(this.url, params, { headers: this.authHeaders() })
      .pipe(this.unwrap());
  }

  /**
   * Schedule the workspace for deletion (`DELETE /v1/workspace`).
   * Only the workspace owner can perform this action.
   */
  delete(): Observable<void> {
    return this.voidRequest('DELETE', this.url);
  }

  /**
   * Update workspace preferences such as locale and notification settings
   * (`PATCH /v1/workspace/preferences`).
   */
  updatePreferences(params: UpdateWorkspacePreferencesParams): Observable<WorkspacePreferences> {
    return this.http
      .patch<{ data: WorkspacePreferences }>(`${this.url}/preferences`, params, {
        headers: this.authHeaders(),
      })
      .pipe(this.unwrap());
  }

  /**
   * Invite a new member to the workspace (`POST /v1/workspace/members/invite`).
   * The invite is accepted automatically when the user first logs in.
   */
  inviteMember(params: InviteMemberParams): Observable<WorkspaceMember> {
    return this.http
      .post<{ data: WorkspaceMember }>(`${this.url}/members/invite`, params, {
        headers: this.authHeaders(),
      })
      .pipe(this.unwrap());
  }

  /**
   * Update a member's role (`PATCH /v1/workspace/members/:userId`).
   */
  updateMember(userId: string, params: UpdateMemberParams): Observable<WorkspaceMember> {
    return this.http
      .patch<{ data: WorkspaceMember }>(`${this.url}/members/${userId}`, params, {
        headers: this.authHeaders(),
      })
      .pipe(this.unwrap());
  }

  /**
   * Remove a member from the workspace (`DELETE /v1/workspace/members/:userId`).
   * The workspace owner cannot be removed.
   */
  removeMember(userId: string): Observable<void> {
    return this.voidRequest('DELETE', `${this.url}/members/${userId}`);
  }
}
