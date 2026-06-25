import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { TRATTO_CONFIG } from '../tratto.config';
import { EmailsService } from './emails.service';

const CONFIG = { apiKey: 'tratto_test_key', baseUrl: 'https://api.tratto.email' };
const BASE = 'https://api.tratto.email/v1/emails';

describe('EmailsService', () => {
  let service: EmailsService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: TRATTO_CONFIG, useValue: CONFIG },
        EmailsService,
      ],
    });
    service = TestBed.inject(EmailsService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  describe('send()', () => {
    it('POSTs to /v1/emails and returns the email id', () => {
      let result: { id: string } | undefined;
      service.send({ from: 'a@b.com', to: 'c@d.com', subject: 'Hi', html: '<p>Hi</p>' })
        .subscribe(r => { result = r; });

      const req = http.expectOne(BASE);
      expect(req.request.method).toBe('POST');
      expect(req.request.headers.get('Authorization')).toBe('Bearer tratto_test_key');
      req.flush({ data: { id: 'em_1' } });
      expect(result).toEqual({ id: 'em_1' });
    });

    it('includes Idempotency-Key header when provided', () => {
      service.send({ from: 'a@b.com', to: 'c@d.com', subject: 'Hi', html: '<p>Hi</p>' }, 'my-key')
        .subscribe();

      const req = http.expectOne(BASE);
      expect(req.request.headers.get('Idempotency-Key')).toBe('my-key');
      req.flush({ data: { id: 'em_1' } });
    });

    it('does not include Idempotency-Key when not provided', () => {
      service.send({ from: 'a@b.com', to: 'c@d.com', subject: 'Hi', html: '<p>Hi</p>' })
        .subscribe();

      const req = http.expectOne(BASE);
      expect(req.request.headers.has('Idempotency-Key')).toBe(false);
      req.flush({ data: { id: 'em_1' } });
    });
  });

  describe('list()', () => {
    it('GETs /v1/emails without params', () => {
      service.list().subscribe();
      const req = http.expectOne(r => r.url === BASE);
      expect(req.request.method).toBe('GET');
      req.flush({ data: [], pagination: { hasMore: false, nextCursor: null } });
    });

    it('passes limit and status as query params', () => {
      service.list({ limit: 10, status: 'delivered' }).subscribe();
      const req = http.expectOne(r => r.url === BASE);
      expect(req.request.params.get('limit')).toBe('10');
      expect(req.request.params.get('status')).toBe('delivered');
      req.flush({ data: [], pagination: { hasMore: false, nextCursor: null } });
    });

    it('serialises Date objects for dateFrom and dateTo', () => {
      const date = new Date('2025-01-01T00:00:00.000Z');
      service.list({ dateFrom: date, dateTo: date }).subscribe();
      const req = http.expectOne(r => r.url === BASE);
      expect(req.request.params.get('dateFrom')).toBe('2025-01-01T00:00:00.000Z');
      expect(req.request.params.get('dateTo')).toBe('2025-01-01T00:00:00.000Z');
      req.flush({ data: [], pagination: { hasMore: false, nextCursor: null } });
    });
  });

  describe('get()', () => {
    it('GETs /v1/emails/:id and unwraps data', () => {
      let result: unknown;
      service.get('em_1').subscribe(r => { result = r; });
      const req = http.expectOne(`${BASE}/em_1`);
      expect(req.request.method).toBe('GET');
      req.flush({ data: { id: 'em_1', events: [] } });
      expect((result as { id: string }).id).toBe('em_1');
    });
  });

  describe('listEvents()', () => {
    it('GETs /v1/emails/:id/events and unwraps data', () => {
      let result: unknown;
      service.listEvents('em_1').subscribe(r => { result = r; });
      const req = http.expectOne(`${BASE}/em_1/events`);
      expect(req.request.method).toBe('GET');
      req.flush({ data: [{ type: 'delivered', occurredAt: '2025-01-01T00:00:00Z' }] });
      expect(Array.isArray(result)).toBe(true);
    });
  });
});
