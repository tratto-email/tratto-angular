import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { TRATTO_CONFIG } from '../tratto.config';
import { ContactsService } from './contacts.service';

const CONFIG = { apiKey: 'tratto_test_key', baseUrl: 'https://api.tratto.email' };
const BASE = 'https://api.tratto.email/v1/contacts';

describe('ContactsService', () => {
  let service: ContactsService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: TRATTO_CONFIG, useValue: CONFIG },
        ContactsService,
      ],
    });
    service = TestBed.inject(ContactsService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  describe('create()', () => {
    it('POSTs to /v1/contacts and returns id', () => {
      let result: unknown;
      service.create({ email: 'alice@example.com', firstName: 'Alice' })
        .subscribe(r => { result = r; });

      const req = http.expectOne(BASE);
      expect(req.request.method).toBe('POST');
      expect(req.request.headers.get('Authorization')).toBe('Bearer tratto_test_key');
      req.flush({ data: { id: 'con_1' } });
      expect(result).toEqual({ id: 'con_1' });
    });
  });

  describe('list()', () => {
    it('GETs /v1/contacts without params', () => {
      service.list().subscribe();
      const req = http.expectOne(r => r.url === BASE);
      expect(req.request.method).toBe('GET');
      req.flush({ data: [], pagination: { hasMore: false, nextCursor: null } });
    });

    it('passes status, audienceId, tag, after, limit as query params', () => {
      service.list({ status: 'subscribed', audienceId: 'aud_1', tag: 'vip', after: 'cur_1', limit: 20 }).subscribe();
      const req = http.expectOne(r => r.url === BASE);
      expect(req.request.params.get('status')).toBe('subscribed');
      expect(req.request.params.get('audienceId')).toBe('aud_1');
      expect(req.request.params.get('tag')).toBe('vip');
      expect(req.request.params.get('after')).toBe('cur_1');
      expect(req.request.params.get('limit')).toBe('20');
      req.flush({ data: [], pagination: { hasMore: false, nextCursor: null } });
    });
  });

  describe('update()', () => {
    it('PATCHes /v1/contacts/:id and returns id', () => {
      let result: unknown;
      service.update('con_1', { status: 'unsubscribed' }).subscribe(r => { result = r; });
      const req = http.expectOne(`${BASE}/con_1`);
      expect(req.request.method).toBe('PATCH');
      req.flush({ data: { id: 'con_1' } });
      expect(result).toEqual({ id: 'con_1' });
    });
  });

  describe('importCsv()', () => {
    it('POSTs CSV to /v1/contacts/import with Content-Type text/csv', () => {
      const csv = 'email\nalice@example.com';
      let result: unknown;
      service.importCsv(csv).subscribe(r => { result = r; });

      const req = http.expectOne(`${BASE}/import`);
      expect(req.request.method).toBe('POST');
      expect(req.request.headers.get('Content-Type')).toBe('text/csv');
      req.flush({ data: { jobId: 'job_1', totalRows: 1 } });
      expect(result).toEqual({ jobId: 'job_1', totalRows: 1 });
    });
  });

  describe('getImportJob()', () => {
    it('GETs /v1/contacts/import/:jobId and unwraps data', () => {
      let result: unknown;
      service.getImportJob('job_1').subscribe(r => { result = r; });
      const req = http.expectOne(`${BASE}/import/job_1`);
      expect(req.request.method).toBe('GET');
      req.flush({ data: { jobId: 'job_1', status: 'completed', totalRows: 1, processedRows: 1, failedRows: 0, errors: [], completedAt: null } });
      expect((result as { jobId: string }).jobId).toBe('job_1');
    });
  });
});
