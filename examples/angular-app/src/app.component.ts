import { Component, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { JsonPipe } from '@angular/common';
import { catchError, EMPTY, finalize } from 'rxjs';
import { TrattoService } from '@tratto/angular';
import type { Contact, AnalyticsSummary, SendEmailParams } from '@tratto/angular';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, JsonPipe],
  styles: [`
    .container { max-width: 820px; margin: 0 auto; }
    h1 { font-size: 1.5rem; margin-bottom: 2rem; }
    .card {
      background: #fff;
      border-radius: 8px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,.1);
    }
    h2 { font-size: 1rem; font-weight: 600; color: #555; margin-bottom: 1rem; }
    form { display: flex; flex-direction: column; gap: .75rem; }
    label { display: flex; flex-direction: column; gap: .25rem; font-size: .875rem; font-weight: 500; }
    input, textarea {
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: .5rem .75rem;
      font-size: .875rem;
      font-family: inherit;
    }
    button {
      align-self: flex-start;
      padding: .5rem 1.25rem;
      background: #000;
      color: #fff;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: .875rem;
    }
    button:disabled { opacity: .45; cursor: default; }
    pre.result {
      background: #f5f5f5;
      border-radius: 4px;
      padding: 1rem;
      font-size: .8rem;
      margin-top: 1rem;
      overflow-x: auto;
      white-space: pre-wrap;
    }
    .error { color: #c00; margin-top: .75rem; font-size: .875rem; }
    table { width: 100%; border-collapse: collapse; margin-top: 1rem; font-size: .875rem; }
    th, td { text-align: left; padding: .5rem .75rem; border-bottom: 1px solid #eee; }
    th { font-weight: 600; color: #555; background: #fafafa; }
  `],
  template: `
    <div class="container">
      <h1>@tratto/angular — Example App</h1>

      <!-- ── Send Email ─────────────────────────────────────────── -->
      <section class="card">
        <h2>Send a transactional email</h2>
        <form #emailForm="ngForm" (ngSubmit)="sendEmail(emailForm)">
          <label>
            From
            <input name="from" [(ngModel)]="draft.from"
                   placeholder="Sender &lt;from@yourdomain.com&gt;" required />
          </label>
          <label>
            To
            <input name="to" [(ngModel)]="draft.to"
                   placeholder="recipient@example.com" required />
          </label>
          <label>
            Subject
            <input name="subject" [(ngModel)]="draft.subject"
                   placeholder="Hello world" required />
          </label>
          <label>
            HTML body
            <textarea name="html" [(ngModel)]="draft.html"
                      rows="3" placeholder="&lt;p&gt;Hello!&lt;/p&gt;"></textarea>
          </label>
          <button type="submit" [disabled]="sending()">
            {{ sending() ? 'Sending…' : 'Send email' }}
          </button>
        </form>

        @if (sendResult()) {
          <pre class="result">{{ sendResult() | json }}</pre>
        }
        @if (sendError()) {
          <p class="error">{{ sendError() }}</p>
        }
      </section>

      <!-- ── Contact list ──────────────────────────────────────── -->
      <section class="card">
        <h2>Contacts</h2>
        <button (click)="loadContacts()" [disabled]="loadingContacts()">
          {{ loadingContacts() ? 'Loading…' : 'Load contacts' }}
        </button>

        @if (contacts().length) {
          <table>
            <thead>
              <tr><th>Email</th><th>Name</th><th>Status</th><th>Tags</th></tr>
            </thead>
            <tbody>
              @for (c of contacts(); track c.id) {
                <tr>
                  <td>{{ c.email }}</td>
                  <td>{{ c.firstName }} {{ c.lastName }}</td>
                  <td>{{ c.status }}</td>
                  <td>{{ c.tags.join(', ') }}</td>
                </tr>
              }
            </tbody>
          </table>
        }
      </section>

      <!-- ── Analytics ─────────────────────────────────────────── -->
      <section class="card">
        <h2>Analytics — last 30 days</h2>
        <button (click)="loadAnalytics()" [disabled]="loadingAnalytics()">
          {{ loadingAnalytics() ? 'Loading…' : 'Load analytics' }}
        </button>

        @if (analytics()) {
          <pre class="result">{{ analytics() | json }}</pre>
        }
      </section>
    </div>
  `,
})
export class AppComponent {
  private tratto = inject(TrattoService);

  draft: Partial<SendEmailParams> = { from: '', to: '', subject: '', html: '' };

  sending = signal(false);
  sendResult = signal<{ id: string } | null>(null);
  sendError = signal<string | null>(null);

  loadingContacts = signal(false);
  contacts = signal<Contact[]>([]);

  loadingAnalytics = signal(false);
  analytics = signal<AnalyticsSummary | null>(null);

  sendEmail(form: NgForm): void {
    if (form.invalid) return;
    this.sending.set(true);
    this.sendResult.set(null);
    this.sendError.set(null);

    this.tratto.emails.send(this.draft as SendEmailParams).pipe(
      catchError(err => {
        this.sendError.set(err.error?.message ?? `HTTP ${err.status}`);
        return EMPTY;
      }),
      finalize(() => this.sending.set(false)),
    ).subscribe(result => this.sendResult.set(result));
  }

  loadContacts(): void {
    this.loadingContacts.set(true);
    this.tratto.contacts.list({ limit: 20 }).pipe(
      catchError(() => EMPTY),
      finalize(() => this.loadingContacts.set(false)),
    ).subscribe(({ data }) => this.contacts.set(data));
  }

  loadAnalytics(): void {
    this.loadingAnalytics.set(true);
    this.tratto.analytics.getSummary('30d').pipe(
      catchError(() => EMPTY),
      finalize(() => this.loadingAnalytics.set(false)),
    ).subscribe(summary => this.analytics.set(summary));
  }
}
