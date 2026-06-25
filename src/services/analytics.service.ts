import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseService } from './base.service';
import type { AnalyticsPeriod, AnalyticsSummary, TimeseriesPoint } from '../tratto.types';

/** Service for querying email analytics and delivery metrics. */
@Injectable()
export class AnalyticsService extends BaseService {
  private readonly url = `${this.apiBaseUrl}/v1/analytics`;

  /**
   * Get aggregated email metrics for a time period (`GET /v1/analytics/summary`).
   * Results are cached server-side for one hour.
   *
   * @param period Lookback window. Defaults to `'30d'`.
   */
  getSummary(period: AnalyticsPeriod = '30d'): Observable<AnalyticsSummary> {
    return this.http
      .get<{ data: AnalyticsSummary }>(`${this.url}/summary`, {
        headers: this.authHeaders(),
        params: this.buildParams({ period }),
      })
      .pipe(this.unwrap());
  }

  /**
   * Get daily email metrics for a time period (`GET /v1/analytics/timeseries`).
   * Returns one data point per day for the chosen window.
   * Results are cached server-side for one hour.
   *
   * @param period Lookback window. Defaults to `'30d'`.
   */
  getTimeseries(period: AnalyticsPeriod = '30d'): Observable<TimeseriesPoint[]> {
    return this.http
      .get<{ data: TimeseriesPoint[] }>(`${this.url}/timeseries`, {
        headers: this.authHeaders(),
        params: this.buildParams({ period }),
      })
      .pipe(this.unwrap());
  }
}
