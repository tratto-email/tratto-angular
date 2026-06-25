import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { TRATTO_CONFIG } from '../tratto.config';
import { BaseService } from './base.service';

@Injectable()
class ConcreteService extends BaseService {
  getApiBaseUrl() { return this.apiBaseUrl; }
  getAuthHeaders(extra?: Record<string, string>) { return this.authHeaders(extra); }
  callBuildParams(params: Record<string, string | number | boolean | Date | null | undefined>) {
    return this.buildParams(params);
  }
  callVoidRequest(method: 'DELETE' | 'PATCH' | 'POST', url: string) {
    return this.voidRequest(method, url);
  }
}

const CONFIG = { apiKey: 'tratto_test_key', baseUrl: 'https://api.tratto.email' };

describe('BaseService', () => {
  let service: ConcreteService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: TRATTO_CONFIG, useValue: CONFIG },
        ConcreteService,
      ],
    });
    service = TestBed.inject(ConcreteService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('apiBaseUrl strips trailing slash', () => {
    expect(service.getApiBaseUrl()).toBe('https://api.tratto.email');
  });

  it('apiBaseUrl falls back to production URL when baseUrl is omitted', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: TRATTO_CONFIG, useValue: { apiKey: 'key' } },
        ConcreteService,
      ],
    });
    expect(TestBed.inject(ConcreteService).getApiBaseUrl()).toBe('https://api.tratto.email');
  });

  it('authHeaders includes Bearer Authorization', () => {
    const headers = service.getAuthHeaders();
    expect(headers.get('Authorization')).toBe('Bearer tratto_test_key');
  });

  it('authHeaders merges extra headers while keeping Authorization', () => {
    const headers = service.getAuthHeaders({ 'X-Custom': 'value' });
    expect(headers.get('Authorization')).toBe('Bearer tratto_test_key');
    expect(headers.get('X-Custom')).toBe('value');
  });

  describe('buildParams()', () => {
    it('omits null and undefined values', () => {
      const p = service.callBuildParams({ a: 'x', b: null, c: undefined });
      expect(p.get('a')).toBe('x');
      expect(p.has('b')).toBe(false);
      expect(p.has('c')).toBe(false);
    });

    it('serialises numbers and booleans to strings', () => {
      const p = service.callBuildParams({ limit: 20, active: true });
      expect(p.get('limit')).toBe('20');
      expect(p.get('active')).toBe('true');
    });

    it('serialises Date values to ISO strings', () => {
      const date = new Date('2025-01-01T00:00:00.000Z');
      const p = service.callBuildParams({ dateFrom: date });
      expect(p.get('dateFrom')).toBe('2025-01-01T00:00:00.000Z');
    });
  });

  it('voidRequest sends the request and maps the response to void', () => {
    let emitted: unknown = 'not-emitted';
    service.callVoidRequest('DELETE', 'https://api.tratto.email/v1/test')
      .subscribe(v => { emitted = v; });

    const req = http.expectOne('https://api.tratto.email/v1/test');
    expect(req.request.method).toBe('DELETE');
    req.flush('', { status: 204, statusText: 'No Content' });
    expect(emitted).toBeUndefined();
  });

  it('voidRequest supports PATCH and POST methods', () => {
    service.callVoidRequest('POST', 'https://api.tratto.email/v1/test').subscribe();
    const req = http.expectOne('https://api.tratto.email/v1/test');
    expect(req.request.method).toBe('POST');
    req.flush('', { status: 204, statusText: 'No Content' });
  });
});
