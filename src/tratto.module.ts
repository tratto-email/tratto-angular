import { NgModule, ModuleWithProviders } from '@angular/core';
import { TRATTO_CONFIG, TrattoService } from './tratto.service';
import type { TrattoConfig } from './tratto.types';

@NgModule({})
export class TrattoModule {
  static forRoot(config: TrattoConfig): ModuleWithProviders<TrattoModule> {
    return {
      ngModule: TrattoModule,
      providers: [
        { provide: TRATTO_CONFIG, useValue: config },
        TrattoService,
      ],
    };
  }
}
