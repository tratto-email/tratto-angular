import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { TRATTO_CONFIG } from '../tratto.config';
import { WorkspaceService } from './workspace.service';

const CONFIG = { apiKey: 'tratto_test_key', baseUrl: 'https://api.tratto.email' };
const BASE = 'https://api.tratto.email/v1/workspace';

describe('WorkspaceService', () => {
  let service: WorkspaceService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: TRATTO_CONFIG, useValue: CONFIG },
        WorkspaceService,
      ],
    });
    service = TestBed.inject(WorkspaceService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  describe('get()', () => {
    it('GETs /v1/workspace and unwraps data', () => {
      let result: unknown;
      service.get().subscribe(r => { result = r; });
      const req = http.expectOne(BASE);
      expect(req.request.method).toBe('GET');
      req.flush({ data: { id: 'ws_1', name: 'Acme' } });
      expect((result as { id: string }).id).toBe('ws_1');
    });
  });

  describe('update()', () => {
    it('PATCHes /v1/workspace with partial fields', () => {
      let result: unknown;
      service.update({ name: 'Acme Corp', timezone: 'Europe/Rome' }).subscribe(r => { result = r; });
      const req = http.expectOne(BASE);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ name: 'Acme Corp', timezone: 'Europe/Rome' });
      req.flush({ data: { id: 'ws_1', name: 'Acme Corp' } });
      expect((result as { name: string }).name).toBe('Acme Corp');
    });
  });

  describe('delete()', () => {
    it('DELETEs /v1/workspace and emits void', () => {
      let emitted: unknown = 'not-emitted';
      service.delete().subscribe(v => { emitted = v; });
      const req = http.expectOne(BASE);
      expect(req.request.method).toBe('DELETE');
      req.flush('', { status: 204, statusText: 'No Content' });
      expect(emitted).toBeUndefined();
    });
  });

  describe('updatePreferences()', () => {
    it('PATCHes /v1/workspace/preferences', () => {
      service.updatePreferences({ locale: 'en', emailNotifications: { weeklyReport: true } }).subscribe();
      const req = http.expectOne(`${BASE}/preferences`);
      expect(req.request.method).toBe('PATCH');
      req.flush({ data: { locale: 'en', emailNotifications: { bounces: true, weeklyReport: true, billingAlerts: false } } });
    });
  });

  describe('inviteMember()', () => {
    it('POSTs to /v1/workspace/members/invite', () => {
      let result: unknown;
      service.inviteMember({ email: 'dev@acme.com', role: 'admin' }).subscribe(r => { result = r; });
      const req = http.expectOne(`${BASE}/members/invite`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ email: 'dev@acme.com', role: 'admin' });
      req.flush({ data: { userId: 'usr_1', email: 'dev@acme.com', role: 'admin', displayName: null, joinedAt: '' } });
      expect((result as { email: string }).email).toBe('dev@acme.com');
    });
  });

  describe('updateMember()', () => {
    it('PATCHes /v1/workspace/members/:userId', () => {
      service.updateMember('usr_1', { role: 'member' }).subscribe();
      const req = http.expectOne(`${BASE}/members/usr_1`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ role: 'member' });
      req.flush({ data: { userId: 'usr_1', role: 'member' } });
    });
  });

  describe('removeMember()', () => {
    it('DELETEs /v1/workspace/members/:userId and emits void', () => {
      let emitted: unknown = 'not-emitted';
      service.removeMember('usr_1').subscribe(v => { emitted = v; });
      const req = http.expectOne(`${BASE}/members/usr_1`);
      expect(req.request.method).toBe('DELETE');
      req.flush('', { status: 204, statusText: 'No Content' });
      expect(emitted).toBeUndefined();
    });
  });
});
