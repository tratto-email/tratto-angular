import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { TRATTO_CONFIG } from '../tratto.config';
import { WebhooksService } from './webhooks.service';

const CONFIG = { apiKey: 'tratto_test_key', baseUrl: 'https://api.tratto.email' };
const BASE = 'https://api.tratto.email/v1/webhooks';

describe('WebhooksService', () => {
  let service: WebhooksService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: TRATTO_CONFIG, useValue: CONFIG },
        WebhooksService,
      ],
    });
    service = TestBed.inject(WebhooksService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  describe('create()', () => {
    it('POSTs to /v1/webhooks and returns id + secret', () => {
      let result: unknown;
      service.create({ url: 'https://app.com/hook', events: ['delivered'] }).subscribe(r => { result = r; });
      const req = http.expectOne(BASE);
      expect(req.request.method).toBe('POST');
      req.flush({ data: { id: 'wh_1', secret: 'secret_abc' } });
      expect(result).toEqual({ id: 'wh_1', secret: 'secret_abc' });
    });
  });

  describe('list()', () => {
    it('GETs /v1/webhooks and unwraps data array', () => {
      let result: unknown;
      service.list().subscribe(r => { result = r; });
      const req = http.expectOne(BASE);
      expect(req.request.method).toBe('GET');
      req.flush({ data: [{ id: 'wh_1' }] });
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('delete()', () => {
    it('DELETEs /v1/webhooks/:id and emits void', () => {
      let emitted: unknown = 'not-emitted';
      service.delete('wh_1').subscribe(v => { emitted = v; });
      const req = http.expectOne(`${BASE}/wh_1`);
      expect(req.request.method).toBe('DELETE');
      req.flush('', { status: 204, statusText: 'No Content' });
      expect(emitted).toBeUndefined();
    });
  });

  describe('listDeliveries()', () => {
    it('GETs /v1/webhooks/:id/deliveries with pagination params', () => {
      service.listDeliveries('wh_1', { limit: 10, after: 'cur_1' }).subscribe();
      const req = http.expectOne(r => r.url === `${BASE}/wh_1/deliveries`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('limit')).toBe('10');
      expect(req.request.params.get('after')).toBe('cur_1');
      req.flush({ data: [], pagination: { hasMore: false, nextCursor: null } });
    });
  });

  describe('test()', () => {
    it('POSTs to /v1/webhooks/:id/test', () => {
      let result: unknown;
      service.test('wh_1').subscribe(r => { result = r; });
      const req = http.expectOne(`${BASE}/wh_1/test`);
      expect(req.request.method).toBe('POST');
      req.flush({ data: { queued: true } });
      expect(result).toEqual({ queued: true });
    });
  });

  describe('rotateSecret()', () => {
    it('POSTs to /v1/webhooks/:id/rotate-secret and returns new secret', () => {
      let result: unknown;
      service.rotateSecret('wh_1').subscribe(r => { result = r; });
      const req = http.expectOne(`${BASE}/wh_1/rotate-secret`);
      expect(req.request.method).toBe('POST');
      req.flush({ data: { secret: 'new_secret_xyz' } });
      expect(result).toEqual({ secret: 'new_secret_xyz' });
    });
  });
});
