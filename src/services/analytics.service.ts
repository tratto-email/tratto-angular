import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseService } from './base.service';
import type { AnalyticsPeriod, AnalyticsSummary, TimeseriesPoint } from '../tratto.types';

/** Service for querying email analytics and delivery metrics. */
@Injectable()
export class AnalyticsService extends BaseService {
  private get url(): string {
    return `${this.apiBaseUrl}/v1/analytics`;
  }

  /**
   * Get aggregated email metrics for a time period (`GET /v1/analytics/summary`).
   * Results are cached server-side for one hour.
   *
   * @param period Lookback window. Defaults to `'30d'`.
   */
  getSummary(period: AnalyticsPeriod = '30d'): Observable<AnalyticsSummary> {
    const params = new HttpParams().set('period', period);
    return this.http
      .get<{ data: AnalyticsSummary }>(`${this.url}/summary`, {
        headers: this.authHeaders(),
        params,
      })
      .pipe(map((r) => r.data));
  }

  /**
   * Get daily email metrics for a time period (`GET /v1/analytics/timeseries`).
   * Returns one data point per day for the chosen window.
   * Results are cached server-side for one hour.
   *
   * @param period Lookback window. Defaults to `'30d'`.
   */
  getTimeseries(period: AnalyticsPeriod = '30d'): Observable<TimeseriesPoint[]> {
    const params = new HttpParams().set('period', period);
    return this.http
      .get<{ data: TimeseriesPoint[] }>(`${this.url}/timeseries`, {
        headers: this.authHeaders(),
        params,
      })
      .pipe(map((r) => r.data));
  }
}
