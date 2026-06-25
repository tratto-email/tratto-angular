import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TRATTO_CONFIG } from './tratto.config';
import { provideTratt, TrattoModule } from './tratto.module';
import { TrattoService } from './tratto.service';
import { EmailsService } from './services/emails.service';
import { AnalyticsService } from './services/analytics.service';

describe('provideTratt()', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideTratt({ apiKey: 'tratto_live_test', baseUrl: 'https://api.tratto.email' }),
      ],
    });
  });

  it('provides TrattoService', () => {
    expect(TestBed.inject(TrattoService)).toBeInstanceOf(TrattoService);
  });

  it('provides individual resource services', () => {
    expect(TestBed.inject(EmailsService)).toBeInstanceOf(EmailsService);
    expect(TestBed.inject(AnalyticsService)).toBeInstanceOf(AnalyticsService);
  });

  it('binds TRATTO_CONFIG with the supplied apiKey', () => {
    const config = TestBed.inject(TRATTO_CONFIG);
    expect(config.apiKey).toBe('tratto_live_test');
  });

  it('binds TRATTO_CONFIG with the supplied baseUrl', () => {
    const config = TestBed.inject(TRATTO_CONFIG);
    expect(config.baseUrl).toBe('https://api.tratto.email');
  });
});

describe('TrattoModule.forRoot()', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TrattoModule.forRoot({ apiKey: 'tratto_test_module' })],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
  });

  it('provides TrattoService via NgModule', () => {
    expect(TestBed.inject(TrattoService)).toBeInstanceOf(TrattoService);
  });

  it('provides individual resource services via NgModule', () => {
    expect(TestBed.inject(EmailsService)).toBeInstanceOf(EmailsService);
  });

  it('binds TRATTO_CONFIG with the supplied apiKey', () => {
    const config = TestBed.inject(TRATTO_CONFIG);
    expect(config.apiKey).toBe('tratto_test_module');
  });
});
