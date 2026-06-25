import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { TRATTO_CONFIG } from '../tratto.config';
import { CampaignsService } from './campaigns.service';

const CONFIG = { apiKey: 'tratto_test_key', baseUrl: 'https://api.tratto.email' };
const BASE = 'https://api.tratto.email/v1/campaigns';

describe('CampaignsService', () => {
  let service: CampaignsService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: TRATTO_CONFIG, useValue: CONFIG },
        CampaignsService,
      ],
    });
    service = TestBed.inject(CampaignsService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  describe('create()', () => {
    it('POSTs to /v1/campaigns and returns id', () => {
      let result: unknown;
      service.create({
        name: 'June NL', templateId: 'tpl_1', audienceId: 'aud_1',
        fromName: 'Acme', fromEmail: 'n@acme.com', subjectA: 'Hello',
      }).subscribe(r => { result = r; });

      const req = http.expectOne(BASE);
      expect(req.request.method).toBe('POST');
      req.flush({ data: { id: 'cmp_1' } });
      expect(result).toEqual({ id: 'cmp_1' });
    });
  });

  describe('list()', () => {
    it('GETs /v1/campaigns and passes status filter', () => {
      service.list({ status: 'draft', limit: 5 }).subscribe();
      const req = http.expectOne(r => r.url === BASE);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('status')).toBe('draft');
      expect(req.request.params.get('limit')).toBe('5');
      req.flush({ data: [], pagination: { hasMore: false, nextCursor: null } });
    });
  });

  describe('get()', () => {
    it('GETs /v1/campaigns/:id and unwraps data', () => {
      let result: unknown;
      service.get('cmp_1').subscribe(r => { result = r; });
      const req = http.expectOne(`${BASE}/cmp_1`);
      expect(req.request.method).toBe('GET');
      req.flush({ data: { id: 'cmp_1' } });
      expect((result as { id: string }).id).toBe('cmp_1');
    });
  });

  describe('getStats()', () => {
    it('GETs /v1/campaigns/:id/stats', () => {
      service.getStats('cmp_1').subscribe();
      const req = http.expectOne(`${BASE}/cmp_1/stats`);
      expect(req.request.method).toBe('GET');
      req.flush({ data: { campaignId: 'cmp_1', status: 'completed', stats: {}, rates: {} } });
    });
  });

  describe('send()', () => {
    it('POSTs to /v1/campaigns/:id/send with empty body', () => {
      let result: unknown;
      service.send('cmp_1').subscribe(r => { result = r; });
      const req = http.expectOne(`${BASE}/cmp_1/send`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({});
      req.flush({ data: { status: 'sending' } });
      expect(result).toEqual({ status: 'sending' });
    });

    it('serialises a Date scheduledAt to ISO string', () => {
      const date = new Date('2025-07-01T09:00:00.000Z');
      service.send('cmp_1', { scheduledAt: date }).subscribe();
      const req = http.expectOne(`${BASE}/cmp_1/send`);
      expect(req.request.body['scheduledAt']).toBe('2025-07-01T09:00:00.000Z');
      req.flush({ data: { status: 'scheduled' } });
    });
  });

  describe('pause()', () => {
    it('POSTs to /v1/campaigns/:id/pause', () => {
      let result: unknown;
      service.pause('cmp_1').subscribe(r => { result = r; });
      const req = http.expectOne(`${BASE}/cmp_1/pause`);
      expect(req.request.method).toBe('POST');
      req.flush({ data: { status: 'paused' } });
      expect(result).toEqual({ status: 'paused' });
    });
  });

  describe('testSend()', () => {
    it('POSTs to /v1/campaigns/:id/test-send with recipient address', () => {
      let result: unknown;
      service.testSend('cmp_1', 'me@example.com').subscribe(r => { result = r; });
      const req = http.expectOne(`${BASE}/cmp_1/test-send`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ to: 'me@example.com' });
      req.flush({ data: { emailId: 'em_test_1' } });
      expect(result).toEqual({ emailId: 'em_test_1' });
    });
  });
});
