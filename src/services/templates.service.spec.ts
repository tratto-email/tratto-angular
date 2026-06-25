import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { TRATTO_CONFIG } from '../tratto.config';
import { TemplatesService } from './templates.service';

const CONFIG = { apiKey: 'tratto_test_key', baseUrl: 'https://api.tratto.email' };
const BASE = 'https://api.tratto.email/v1/templates';

describe('TemplatesService', () => {
  let service: TemplatesService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: TRATTO_CONFIG, useValue: CONFIG },
        TemplatesService,
      ],
    });
    service = TestBed.inject(TemplatesService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  describe('list()', () => {
    it('GETs /v1/templates with status filter', () => {
      service.list({ status: 'published', limit: 10 }).subscribe();
      const req = http.expectOne(r => r.url === BASE);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('status')).toBe('published');
      expect(req.request.params.get('limit')).toBe('10');
      req.flush({ data: [], pagination: { hasMore: false, nextCursor: null } });
    });
  });

  describe('create()', () => {
    it('POSTs to /v1/templates and returns full Template', () => {
      let result: unknown;
      service.create({ name: 'Welcome', html: '<h1>Hi</h1>' }).subscribe(r => { result = r; });
      const req = http.expectOne(BASE);
      expect(req.request.method).toBe('POST');
      req.flush({ data: { id: 'tpl_1', name: 'Welcome', html: '<h1>Hi</h1>', status: 'draft', version: 1, createdAt: '', updatedAt: '' } });
      expect((result as { id: string }).id).toBe('tpl_1');
    });
  });

  describe('get()', () => {
    it('GETs /v1/templates/:id', () => {
      service.get('tpl_1').subscribe();
      const req = http.expectOne(`${BASE}/tpl_1`);
      expect(req.request.method).toBe('GET');
      req.flush({ data: { id: 'tpl_1' } });
    });
  });

  describe('update()', () => {
    it('PATCHes /v1/templates/:id and returns updated Template', () => {
      let result: unknown;
      service.update('tpl_1', { html: '<h1>Updated</h1>' }).subscribe(r => { result = r; });
      const req = http.expectOne(`${BASE}/tpl_1`);
      expect(req.request.method).toBe('PATCH');
      req.flush({ data: { id: 'tpl_1', version: 2 } });
      expect((result as { id: string }).id).toBe('tpl_1');
    });
  });

  describe('delete()', () => {
    it('DELETEs /v1/templates/:id and emits void', () => {
      let emitted: unknown = 'not-emitted';
      service.delete('tpl_1').subscribe(v => { emitted = v; });
      const req = http.expectOne(`${BASE}/tpl_1`);
      expect(req.request.method).toBe('DELETE');
      req.flush('', { status: 204, statusText: 'No Content' });
      expect(emitted).toBeUndefined();
    });
  });

  describe('listVersions()', () => {
    it('GETs /v1/templates/:id/versions', () => {
      let result: unknown;
      service.listVersions('tpl_1').subscribe(r => { result = r; });
      const req = http.expectOne(`${BASE}/tpl_1/versions`);
      expect(req.request.method).toBe('GET');
      req.flush({ data: [{ version: 1, savedAt: '2025-01-01' }] });
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getVersion()', () => {
    it('GETs /v1/templates/:id/versions/:version', () => {
      service.getVersion('tpl_1', 2).subscribe();
      const req = http.expectOne(`${BASE}/tpl_1/versions/2`);
      expect(req.request.method).toBe('GET');
      req.flush({ data: { version: 2, savedAt: '', html: '<h1>v2</h1>' } });
    });
  });

  describe('testSend()', () => {
    it('POSTs to /v1/templates/:id/test-send with to and variables', () => {
      let result: unknown;
      service.testSend('tpl_1', 'me@example.com', { name: 'Alice' }).subscribe(r => { result = r; });
      const req = http.expectOne(`${BASE}/tpl_1/test-send`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ to: 'me@example.com', variables: { name: 'Alice' } });
      req.flush({ data: { queued: true } });
      expect(result).toEqual({ queued: true });
    });

    it('defaults variables to empty object when omitted', () => {
      service.testSend('tpl_1', 'me@example.com').subscribe();
      const req = http.expectOne(`${BASE}/tpl_1/test-send`);
      expect(req.request.body).toEqual({ to: 'me@example.com', variables: {} });
      req.flush({ data: { queued: true } });
    });
  });
});
