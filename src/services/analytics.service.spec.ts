import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { TRATTO_CONFIG } from '../tratto.config';
import { AnalyticsService } from './analytics.service';

const CONFIG = { apiKey: 'tratto_test_key', baseUrl: 'https://api.tratto.email' };
const BASE = 'https://api.tratto.email/v1/analytics';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: TRATTO_CONFIG, useValue: CONFIG },
        AnalyticsService,
      ],
    });
    service = TestBed.inject(AnalyticsService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  describe('getSummary()', () => {
    it('GETs /v1/analytics/summary with default period 30d', () => {
      service.getSummary().subscribe();
      const req = http.expectOne(r => r.url === `${BASE}/summary`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('period')).toBe('30d');
      req.flush({ data: { period: '30d', totalSent: 0, delivered: 0, opened: 0, clicked: 0, bounced: 0, complained: 0, deliveryRate: 0, openRate: 0, clickRate: 0, bounceRate: 0 } });
    });

    it('passes explicit period parameter', () => {
      service.getSummary('7d').subscribe();
      const req = http.expectOne(r => r.url === `${BASE}/summary`);
      expect(req.request.params.get('period')).toBe('7d');
      req.flush({ data: {} });
    });
  });

  describe('getTimeseries()', () => {
    it('GETs /v1/analytics/timeseries with default period 30d', () => {
      service.getTimeseries().subscribe();
      const req = http.expectOne(r => r.url === `${BASE}/timeseries`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('period')).toBe('30d');
      req.flush({ data: [] });
    });

    it('passes explicit period 90d', () => {
      service.getTimeseries('90d').subscribe();
      const req = http.expectOne(r => r.url === `${BASE}/timeseries`);
      expect(req.request.params.get('period')).toBe('90d');
      req.flush({ data: [] });
    });
  });
});
