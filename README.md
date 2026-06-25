# @tratto/angular

Official Angular SDK for the [Tratto](https://tratto.email) email platform.

[![npm](https://img.shields.io/npm/v/@tratto/angular)](https://www.npmjs.com/package/@tratto/angular)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Installation

```bash
npm install @tratto/angular
```

`@tratto/angular` requires Angular 22+ and `@angular/common/http`. No other peer dependencies.

---

## Setup

### Standalone applications (Angular 14+)

```ts
// app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideTratt } from '@tratto/angular';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    provideTratt({ apiKey: 'tratto_live_...' }),
  ],
};
```

### NgModule applications

```ts
// app.module.ts
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { TrattoModule } from '@tratto/angular';

@NgModule({
  imports: [
    HttpClientModule,
    TrattoModule.forRoot({ apiKey: 'tratto_live_...' }),
  ],
})
export class AppModule {}
```

### Custom base URL

```ts
provideTratt({
  apiKey: 'tratto_live_...',
  baseUrl: 'https://api.tratto.email', // optional — this is the default
})
```

---

## Usage

Inject `TrattoService` (facade) or any individual resource service.

```ts
import { Component, inject } from '@angular/core';
import { TrattoService } from '@tratto/angular';

@Component({ ... })
export class MyComponent {
  private tratto = inject(TrattoService);
}
```

You can also inject resource services directly:

```ts
import { EmailsService } from '@tratto/angular';

@Component({ ... })
export class MyComponent {
  private emails = inject(EmailsService);
}
```

All methods return `Observable<T>`. Subscribe or use the `async` pipe as you would with any Angular HTTP call.

---

## API Reference

### Emails

```ts
const { emails } = inject(TrattoService);
```

#### `emails.send(params, idempotencyKey?)`

Send a transactional email. At least one of `html`, `text`, or `templateId` is required.

```ts
emails.send({
  from: 'Tratto <hello@mail.acme.com>',
  to: 'user@example.com',
  subject: 'Welcome!',
  html: '<p>Hello world</p>',
}).subscribe(({ id }) => console.log('Email sent:', id));
```

With a template and idempotency key:

```ts
emails.send(
  {
    from: 'hello@mail.acme.com',
    to: ['alice@example.com', 'bob@example.com'],
    subject: 'Reset your password',
    templateId: 'tpl_abc123',
    variables: { name: 'Alice', link: 'https://...' },
  },
  'unique-idempotency-key',
).subscribe(({ id }) => console.log(id));
```

#### `emails.list(params?)`

```ts
emails.list({ limit: 20, status: 'delivered' })
  .subscribe(({ data, pagination }) => console.log(data));
```

#### `emails.get(id)`

```ts
emails.get('em_abc123').subscribe(email => console.log(email));
```

#### `emails.listEvents(id)`

```ts
emails.listEvents('em_abc123').subscribe(events => console.log(events));
```

---

### Contacts

```ts
const { contacts } = inject(TrattoService);
```

#### `contacts.create(params)`

```ts
contacts.create({
  email: 'alice@example.com',
  firstName: 'Alice',
  tags: ['vip'],
}).subscribe(({ id }) => console.log(id));
```

#### `contacts.list(params?)`

```ts
contacts.list({ status: 'subscribed', limit: 50 })
  .subscribe(({ data }) => console.log(data));
```

#### `contacts.update(id, params)`

```ts
contacts.update('con_abc123', { status: 'unsubscribed' })
  .subscribe(({ id }) => console.log(id));
```

#### `contacts.importCsv(csvText)`

Bulk-import contacts from a CSV string (async job). Poll `getImportJob` to track progress.

```ts
const csv = `email,first_name,last_name
alice@example.com,Alice,Smith
bob@example.com,Bob,Jones`;

contacts.importCsv(csv).subscribe(({ jobId }) => {
  contacts.getImportJob(jobId).subscribe(status => console.log(status));
});
```

---

### Audiences

```ts
const { audiences } = inject(TrattoService);
```

```ts
// Create a dynamic segment
audiences.create({
  name: 'Power users',
  rules: [{ field: 'tags', operator: 'array_contains', value: 'vip' }],
}).subscribe(({ id }) => console.log(id));

// List
audiences.list().subscribe(({ data }) => console.log(data));

// Add contacts (up to 500 IDs per call)
audiences.addContacts('aud_abc123', ['con_1', 'con_2'])
  .subscribe(result => console.log(result.added));
```

---

### Campaigns

```ts
const { campaigns } = inject(TrattoService);
```

```ts
// Create a draft campaign
campaigns.create({
  name: 'June Newsletter',
  templateId: 'tpl_abc123',
  audienceId: 'aud_abc123',
  fromName: 'Acme',
  fromEmail: 'news@mail.acme.com',
  subjectA: 'Our June update',
}).subscribe(({ id }) => console.log(id));

// Send immediately
campaigns.send('cmp_abc123').subscribe(({ status }) => console.log(status));

// Schedule for a future date
campaigns.send('cmp_abc123', { scheduledAt: new Date('2025-07-01T09:00:00Z') })
  .subscribe(({ status }) => console.log(status));

// Delivery stats
campaigns.getStats('cmp_abc123').subscribe(stats => console.log(stats.rates));

// Pause
campaigns.pause('cmp_abc123').subscribe();

// Test send
campaigns.testSend('cmp_abc123', 'me@example.com')
  .subscribe(({ emailId }) => console.log(emailId));
```

---

### Templates

```ts
const { templates } = inject(TrattoService);
```

```ts
// Create
templates.create({ name: 'Welcome email', html: '<h1>Hi {{name}}!</h1>' })
  .subscribe(tpl => console.log(tpl.id));

// Update (auto-creates a new version)
templates.update('tpl_abc123', { html: '<h1>Hello {{name}}!</h1>' })
  .subscribe(tpl => console.log(tpl.version));

// Version history
templates.listVersions('tpl_abc123').subscribe(versions => console.log(versions));
templates.getVersion('tpl_abc123', 2).subscribe(v => console.log(v.html));

// Test send
templates.testSend('tpl_abc123', 'me@example.com', { name: 'Alice' }).subscribe();

// Delete
templates.delete('tpl_abc123').subscribe();
```

---

### Webhooks

```ts
const { webhooks } = inject(TrattoService);
```

```ts
// Register — save the secret, it is shown only once
webhooks.create({
  url: 'https://my-app.com/webhooks/tratto',
  events: ['delivered', 'bounced', 'complained'],
}).subscribe(({ id, secret }) => {
  console.log('Webhook ID:', id);
  console.log('Signing secret (save this!):', secret);
});

// List
webhooks.list().subscribe(hooks => console.log(hooks));

// Delivery history
webhooks.listDeliveries('wh_abc123', { limit: 20 })
  .subscribe(({ data }) => console.log(data));

// Test connectivity
webhooks.test('wh_abc123').subscribe(({ queued }) => console.log(queued));

// Rotate signing secret
webhooks.rotateSecret('wh_abc123').subscribe(({ secret }) => console.log(secret));

// Delete
webhooks.delete('wh_abc123').subscribe();
```

---

### Domains

```ts
const { domains } = inject(TrattoService);
```

```ts
// Add domain — response contains the DNS records to publish
domains.add('mail.acme.com').subscribe(domain => {
  console.log('Publish these DNS records:', domain.records);
});

// Trigger SPF/DKIM/DMARC verification
domains.verify('dom_abc123').subscribe(domain => console.log(domain.status));

// List / get
domains.list().subscribe(({ data }) => console.log(data));
domains.get('dom_abc123').subscribe(domain => console.log(domain));

// Delete
domains.delete('dom_abc123').subscribe(({ deletedAt }) => console.log(deletedAt));
```

---

### API Keys

```ts
const { apiKeys } = inject(TrattoService);
```

```ts
// Create — raw key is shown only once
apiKeys.create({
  name: 'CI deployment key',
  env: 'live',
  permissions: ['emails:send'],
}).subscribe(key => {
  console.log('Raw key (save this!):', key.key);
});

// List (prefix only, never raw token)
apiKeys.list().subscribe(({ data }) => console.log(data));

// Revoke
apiKeys.revoke('key_abc123').subscribe(({ revokedAt }) => console.log(revokedAt));
```

---

### Analytics

```ts
const { analytics } = inject(TrattoService);
```

```ts
// Aggregated summary
analytics.getSummary('30d').subscribe(summary => {
  console.log('Open rate:', summary.openRate);
  console.log('Bounce rate:', summary.bounceRate);
});

// Daily timeseries
analytics.getTimeseries('7d').subscribe(points => console.log(points));
```

Supported periods: `'7d'` | `'30d'` | `'90d'`. Results are cached server-side for 1 hour.

---

### Flows

```ts
const { flows } = inject(TrattoService);
```

```ts
// Create a draft flow
flows.create({ name: 'Welcome series' }).subscribe(({ id }) => console.log(id));

// Configure trigger and steps
flows.update('flw_abc123', {
  trigger: { type: 'contact_joins_audience', config: { audienceId: 'aud_abc123' } },
  steps: [
    { id: 'step_1', type: 'send_email', config: { templateId: 'tpl_abc123' } },
    { id: 'step_2', type: 'wait',       config: { delay: '3d' } },
    { id: 'step_3', type: 'send_email', config: { templateId: 'tpl_def456' } },
  ],
}).subscribe();

// Activate / deactivate
flows.activate('flw_abc123').subscribe(flow => console.log(flow.status));
flows.deactivate('flw_abc123').subscribe();

// Delete (draft or inactive only)
flows.delete('flw_abc123').subscribe();
```

---

### Workspace

```ts
const { workspace } = inject(TrattoService);
```

```ts
// Get current workspace
workspace.get().subscribe(ws => console.log(ws.name, ws.plan));

// Update settings
workspace.update({ name: 'Acme Corp', timezone: 'Europe/Rome' }).subscribe();

// Preferences
workspace.updatePreferences({
  locale: 'en',
  emailNotifications: { weeklyReport: true },
}).subscribe();

// Team management
workspace.inviteMember({ email: 'dev@acme.com', role: 'admin' }).subscribe();
workspace.updateMember('usr_abc123', { role: 'member' }).subscribe();
workspace.removeMember('usr_abc123').subscribe();
```

---

## Error handling

HTTP errors surface as Angular `HttpErrorResponse`. Use `catchError` from RxJS:

```ts
import { catchError, EMPTY } from 'rxjs';

emails.send({ from: '...', to: '...', subject: '...', html: '...' }).pipe(
  catchError(err => {
    console.error(err.status, err.error?.message);
    return EMPTY;
  }),
).subscribe(({ id }) => console.log(id));
```

---

## TypeScript

The SDK ships full type declarations. All request params and response shapes are exported:

```ts
import type {
  SendEmailParams,
  EmailDetail,
  EmailEvent,
  PaginatedResponse,
  Contact,
  Audience,
  Campaign,
  CampaignStatsDetail,
  Template,
  Webhook,
  Domain,
  ApiKey,
  ApiKeyCreated,
  AnalyticsSummary,
  TimeseriesPoint,
  Flow,
  Workspace,
  WorkspaceMember,
} from '@tratto/angular';
```

---

## Example app

See [`examples/angular-app`](examples/angular-app) for a runnable Angular 22 standalone app
that demonstrates SDK setup, email sending, contact listing, and analytics.

---

## License

MIT
