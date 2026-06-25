# Changelog

All notable changes to `@tratto/angular` are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [0.1.0] — 2026-06-25

### Added

- Initial release of the `@tratto/angular` SDK.
- `EmailsService` — send transactional emails, list, get detail, list events.
- `ContactsService` — create, list, update, CSV bulk import with async job polling.
- `AudiencesService` — create, list, get, add contacts.
- `CampaignsService` — create, list, get, stats, send, pause, test-send.
- `TemplatesService` — CRUD, version history, test-send.
- `WebhooksService` — create, list, delete, delivery history, test, rotate secret.
- `DomainsService` — add, list, get, verify DNS records, delete.
- `ApiKeysService` — create, list, revoke.
- `AnalyticsService` — aggregated summary and daily timeseries (7d / 30d / 90d).
- `FlowsService` — create, list, get, update, delete, activate, deactivate.
- `WorkspaceService` — settings, preferences, member invite / update / remove.
- `TrattoService` facade giving unified access to all resource services.
- `provideTratt()` for standalone Angular 14+ applications.
- `TrattoModule.forRoot()` for NgModule-based applications.
- Full TypeScript type definitions for all request params and response shapes.
