import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { TRATTO_CONFIG } from '../tratto.config';
import { AudiencesService } from './audiences.service';

const CONFIG = { apiKey: 'tratto_test_key', baseUrl: 'https://api.tratto.email' };
const BASE = 'https://api.tratto.email/v1/audiences';

describe('AudiencesService', () => {
  let service: AudiencesService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: TRATTO_CONFIG, useValue: CONFIG },
        AudiencesService,
      ],
    });
    service = TestBed.inject(AudiencesService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  describe('create()', () => {
    it('POSTs to /v1/audiences and returns id', () => {
      let result: unknown;
      service.create({ name: 'VIPs' }).subscribe(r => { result = r; });
      const req = http.expectOne(BASE);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ name: 'VIPs' });
      req.flush({ data: { id: 'aud_1' } });
      expect(result).toEqual({ id: 'aud_1' });
    });
  });

  describe('list()', () => {
    it('GETs /v1/audiences and passes pagination params', () => {
      service.list({ after: 'cur_1', limit: 5 }).subscribe();
      const req = http.expectOne(r => r.url === BASE);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('after')).toBe('cur_1');
      expect(req.request.params.get('limit')).toBe('5');
      req.flush({ data: [], pagination: { hasMore: false, nextCursor: null } });
    });
  });

  describe('get()', () => {
    it('GETs /v1/audiences/:id and unwraps data', () => {
      let result: unknown;
      service.get('aud_1').subscribe(r => { result = r; });
      const req = http.expectOne(`${BASE}/aud_1`);
      expect(req.request.method).toBe('GET');
      req.flush({ data: { id: 'aud_1', name: 'VIPs', contactCount: 0, rules: [], createdAt: '' } });
      expect((result as { id: string }).id).toBe('aud_1');
    });
  });

  describe('addContacts()', () => {
    it('POSTs contactIds to /v1/audiences/:id/contacts', () => {
      let result: unknown;
      service.addContacts('aud_1', ['con_1', 'con_2']).subscribe(r => { result = r; });
      const req = http.expectOne(`${BASE}/aud_1/contacts`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ contactIds: ['con_1', 'con_2'] });
      req.flush({ data: { added: 2, alreadyInAudience: 0, notFound: 0 } });
      expect(result).toEqual({ added: 2, alreadyInAudience: 0, notFound: 0 });
    });
  });
});
