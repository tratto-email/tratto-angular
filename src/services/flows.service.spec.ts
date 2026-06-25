import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { TRATTO_CONFIG } from '../tratto.config';
import { FlowsService } from './flows.service';

const CONFIG = { apiKey: 'tratto_test_key', baseUrl: 'https://api.tratto.email' };
const BASE = 'https://api.tratto.email/v1/flows';

describe('FlowsService', () => {
  let service: FlowsService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: TRATTO_CONFIG, useValue: CONFIG },
        FlowsService,
      ],
    });
    service = TestBed.inject(FlowsService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  describe('list()', () => {
    it('GETs /v1/flows with pagination params', () => {
      service.list({ after: 'cur_1', limit: 5 }).subscribe();
      const req = http.expectOne(r => r.url === BASE);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('after')).toBe('cur_1');
      req.flush({ data: [], pagination: { hasMore: false, nextCursor: null } });
    });
  });

  describe('create()', () => {
    it('POSTs to /v1/flows and returns id', () => {
      let result: unknown;
      service.create({ name: 'Welcome series' }).subscribe(r => { result = r; });
      const req = http.expectOne(BASE);
      expect(req.request.method).toBe('POST');
      req.flush({ data: { id: 'flw_1' } });
      expect(result).toEqual({ id: 'flw_1' });
    });
  });

  describe('get()', () => {
    it('GETs /v1/flows/:id', () => {
      service.get('flw_1').subscribe();
      const req = http.expectOne(`${BASE}/flw_1`);
      expect(req.request.method).toBe('GET');
      req.flush({ data: { id: 'flw_1' } });
    });
  });

  describe('update()', () => {
    it('PATCHes /v1/flows/:id with name', () => {
      let result: unknown;
      service.update('flw_1', { name: 'Updated series' }).subscribe(r => { result = r; });
      const req = http.expectOne(`${BASE}/flw_1`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ name: 'Updated series' });
      req.flush({ data: { id: 'flw_1', name: 'Updated series' } });
      expect((result as { id: string }).id).toBe('flw_1');
    });
  });

  describe('delete()', () => {
    it('DELETEs /v1/flows/:id and returns { id }', () => {
      let result: unknown;
      service.delete('flw_1').subscribe(r => { result = r; });
      const req = http.expectOne(`${BASE}/flw_1`);
      expect(req.request.method).toBe('DELETE');
      req.flush({ data: { id: 'flw_1' } });
      expect(result).toEqual({ id: 'flw_1' });
    });
  });

  describe('activate()', () => {
    it('POSTs to /v1/flows/:id/activate and returns updated Flow', () => {
      let result: unknown;
      service.activate('flw_1').subscribe(r => { result = r; });
      const req = http.expectOne(`${BASE}/flw_1/activate`);
      expect(req.request.method).toBe('POST');
      req.flush({ data: { id: 'flw_1', status: 'active' } });
      expect((result as { status: string }).status).toBe('active');
    });
  });

  describe('deactivate()', () => {
    it('POSTs to /v1/flows/:id/deactivate and returns updated Flow', () => {
      let result: unknown;
      service.deactivate('flw_1').subscribe(r => { result = r; });
      const req = http.expectOne(`${BASE}/flw_1/deactivate`);
      expect(req.request.method).toBe('POST');
      req.flush({ data: { id: 'flw_1', status: 'inactive' } });
      expect((result as { status: string }).status).toBe('inactive');
    });
  });
});
