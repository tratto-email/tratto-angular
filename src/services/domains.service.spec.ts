import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { TRATTO_CONFIG } from '../tratto.config';
import { DomainsService } from './domains.service';

const CONFIG = { apiKey: 'tratto_test_key', baseUrl: 'https://api.tratto.email' };
const BASE = 'https://api.tratto.email/v1/domains';

describe('DomainsService', () => {
  let service: DomainsService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: TRATTO_CONFIG, useValue: CONFIG },
        DomainsService,
      ],
    });
    service = TestBed.inject(DomainsService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  describe('add()', () => {
    it('POSTs { domain } to /v1/domains and returns Domain with records', () => {
      let result: unknown;
      service.add('mail.acme.com').subscribe(r => { result = r; });
      const req = http.expectOne(BASE);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ domain: 'mail.acme.com' });
      req.flush({ data: { id: 'dom_1', domain: 'mail.acme.com', status: 'pending', records: [] } });
      expect((result as { id: string }).id).toBe('dom_1');
    });
  });

  describe('list()', () => {
    it('GETs /v1/domains with pagination params', () => {
      service.list({ after: 'cur_1', limit: 10 }).subscribe();
      const req = http.expectOne(r => r.url === BASE);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('after')).toBe('cur_1');
      expect(req.request.params.get('limit')).toBe('10');
      req.flush({ data: [], pagination: { hasMore: false, nextCursor: null } });
    });
  });

  describe('get()', () => {
    it('GETs /v1/domains/:id', () => {
      service.get('dom_1').subscribe();
      const req = http.expectOne(`${BASE}/dom_1`);
      expect(req.request.method).toBe('GET');
      req.flush({ data: { id: 'dom_1', records: [] } });
    });
  });

  describe('verify()', () => {
    it('POSTs to /v1/domains/:id/verify and returns updated Domain', () => {
      let result: unknown;
      service.verify('dom_1').subscribe(r => { result = r; });
      const req = http.expectOne(`${BASE}/dom_1/verify`);
      expect(req.request.method).toBe('POST');
      req.flush({ data: { id: 'dom_1', status: 'verified', records: [] } });
      expect((result as { status: string }).status).toBe('verified');
    });
  });

  describe('delete()', () => {
    it('DELETEs /v1/domains/:id and returns { id, deletedAt }', () => {
      let result: unknown;
      service.delete('dom_1').subscribe(r => { result = r; });
      const req = http.expectOne(`${BASE}/dom_1`);
      expect(req.request.method).toBe('DELETE');
      req.flush({ data: { id: 'dom_1', deletedAt: '2025-01-01T00:00:00Z' } });
      expect(result).toEqual({ id: 'dom_1', deletedAt: '2025-01-01T00:00:00Z' });
    });
  });
});
