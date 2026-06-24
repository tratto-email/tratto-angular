# @tratto/angular

Angular integration for [Tratto](https://tratto.email) — transactional and marketing email platform.

Requires Angular 22+.

## Installation

```bash
npm install @tratto/angular
```

## Usage

```typescript
import { TrattoModule } from '@tratto/angular';

@NgModule({
  imports: [
    TrattoModule.forRoot({ apiKey: 'tratto_live_...' }),
  ],
})
export class AppModule {}
```

Or with standalone bootstrapping:

```typescript
import { TRATTO_CONFIG } from '@tratto/angular';

bootstrapApplication(AppComponent, {
  providers: [
    { provide: TRATTO_CONFIG, useValue: { apiKey: 'tratto_live_...' } },
  ],
});
```

## Documentation

Full docs at [tratto.email/docs](https://tratto.email/docs).

## Contributing

Issues and PRs welcome. See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

MIT
