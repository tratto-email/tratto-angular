import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { TRATTO_CONFIG } from '../tratto.config';
import { ApiKeysService } from './api-keys.service';

const CONFIG = { apiKey: 'tratto_test_key', baseUrl: 'https://api.tratto.email' };
const BASE = 'https://api.tratto.email/v1/api-keys';

describe('ApiKeysService', () => {
  let service: ApiKeysService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: TRATTO_CONFIG, useValue: CONFIG },
        ApiKeysService,
      ],
    });
    service = TestBed.inject(ApiKeysService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  describe('create()', () => {
    const params = { name: 'CI key', env: 'live' as const, permissions: ['emails:send'] };

    it('POSTs to /v1/api-keys and returns ApiKeyCreated', () => {
      let result: unknown;
      service.create(params).subscribe(r => { result = r; });
      const req = http.expectOne(BASE);
      expect(req.request.method).toBe('POST');
      expect(req.request.headers.get('Authorization')).toBe('Bearer tratto_test_key');
      req.flush({ data: { id: 'key_1', key: 'tratto_live_abc123', name: 'CI key', env: 'live', permissions: ['emails:send'], prefix: 'tratto_live_abc1', createdAt: '', lastUsedAt: null, revokedAt: null } });
      expect((result as { key: string }).key).toBe('tratto_live_abc123');
    });

    it('includes Idempotency-Key header when provided', () => {
      service.create(params, 'idem-key').subscribe();
      const req = http.expectOne(BASE);
      expect(req.request.headers.get('Idempotency-Key')).toBe('idem-key');
      req.flush({ data: { id: 'key_1', key: 'tratto_live_abc123', name: 'CI key', env: 'live', permissions: [], prefix: '', createdAt: '', lastUsedAt: null, revokedAt: null } });
    });
  });

  describe('list()', () => {
    it('GETs /v1/api-keys with pagination params', () => {
      service.list({ after: 'cur_1', limit: 5 }).subscribe();
      const req = http.expectOne(r => r.url === BASE);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('after')).toBe('cur_1');
      expect(req.request.params.get('limit')).toBe('5');
      req.flush({ data: [], pagination: { hasMore: false, nextCursor: null } });
    });
  });

  describe('revoke()', () => {
    it('DELETEs /v1/api-keys/:id and returns { id, revokedAt }', () => {
      let result: unknown;
      service.revoke('key_1').subscribe(r => { result = r; });
      const req = http.expectOne(`${BASE}/key_1`);
      expect(req.request.method).toBe('DELETE');
      req.flush({ data: { id: 'key_1', revokedAt: '2025-01-01T00:00:00Z' } });
      expect(result).toEqual({ id: 'key_1', revokedAt: '2025-01-01T00:00:00Z' });
    });
  });
});
