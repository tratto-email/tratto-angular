import { inject, InjectionToken } from '@angular/core';
import { Service } from '@angular/core';
import type { TrattoConfig } from './tratto.types';

export const TRATTO_CONFIG = new InjectionToken<TrattoConfig>('TRATTO_CONFIG');

@Service({ autoProvided: false })
export class TrattoService {
  readonly config = inject(TRATTO_CONFIG);
}
