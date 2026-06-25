# Contributing to `@tratto/angular`

Thank you for your interest in contributing! This guide covers everything you need to get started.

---

## Table of contents

- [Code of conduct](#code-of-conduct)
- [Getting started](#getting-started)
- [Running tests](#running-tests)
- [Project structure](#project-structure)
- [Development workflow](#development-workflow)
- [Coding standards](#coding-standards)
- [Adding a new resource service](#adding-a-new-resource-service)
- [Submitting a pull request](#submitting-a-pull-request)
- [Release process](#release-process)

---

## Code of conduct

Be respectful and constructive. We follow the [Contributor Covenant](https://www.contributor-covenant.org/version/2/1/code_of_conduct/) code of conduct.

---

## Getting started

### Prerequisites

| Tool | Version |
|---|---|
| Node.js | 20 LTS or later |
| npm | 10+ |
| Angular CLI | 22+ |

### Fork and clone

```bash
git clone https://github.com/<your-fork>/tratto-angular.git
cd tratto-angular
npm install
```

### Build the library

```bash
npm run build
# output: dist/
```

### Link locally for testing

```bash
# In this repo
cd dist && npm link

# In your Angular test app
npm link @tratto/angular
```

---

## Running tests

Tests use [Vitest](https://vitest.dev/) with Angular's `TestBed` and `HttpClientTestingModule`.

```bash
# Run the full suite once
npm test

# Watch mode (re-runs on file changes)
npm run test:watch

# With coverage report (output in coverage/)
npm run test:coverage
```

### Test structure

Each service has a corresponding `*.spec.ts` file alongside it in `src/services/`. Tests follow this pattern:

1. Set up `TestBed` with `provideHttpClient()`, `provideHttpClientTesting()`, `TRATTO_CONFIG`, and the service under test.
2. Use `HttpTestingController` to assert the correct HTTP method, URL, headers, and query parameters.
3. Flush a mock response and assert the Observable emits the correctly unwrapped data.
4. Call `http.verify()` in `afterEach` to catch any unexpected pending requests.

When adding a new service, add a matching `*.spec.ts` that covers every public method.

---

## Project structure

```
tratto-angular/
├── src/
│   ├── index.ts                  # Public API surface (re-exports everything)
│   ├── tratto.config.ts          # TrattoConfig interface + TRATTO_CONFIG token
│   ├── tratto.types.ts           # All request/response TypeScript interfaces
│   ├── tratto.module.ts          # provideTratt() + TrattoModule.forRoot()
│   ├── tratto.service.ts         # TrattoService facade (one property per resource)
│   ├── tratto.module.spec.ts     # Tests for providers and NgModule
│   ├── tratto.service.spec.ts    # Tests for the facade
│   └── services/
│       ├── base.service.ts         # Abstract base: HttpClient, auth headers, void helper
│       ├── base.service.spec.ts
│       ├── emails.service.ts
│       ├── emails.service.spec.ts
│       └── ... (one .ts + .spec.ts pair per resource)
├── examples/
│   └── angular-app/              # Minimal runnable demo
├── vitest.config.ts
├── vitest.setup.ts
├── ng-package.json             # ng-packagr config
├── tsconfig.json
└── package.json
```

---

## Development workflow

### Branch naming

| Type | Pattern | Example |
|---|---|---|
| Feature | `feat/<short-description>` | `feat/add-suppressions-service` |
| Bug fix | `fix/<short-description>` | `fix/void-response-parse-error` |
| Docs | `docs/<short-description>` | `docs/improve-readme-examples` |
| Refactor | `refactor/<short-description>` | `refactor/simplify-base-service` |

### Commit messages

We use **[Conventional Commits](https://www.conventionalcommits.org/)**.

```
<type>(<scope>): <short summary>
```

Allowed types: `feat`, `fix`, `docs`, `refactor`, `chore`, `test`.

Examples:

```
feat(contacts): add deleteContact method
fix(emails): handle 204 response without body
docs: add flow automation example to README
test(campaigns): add spec for scheduledAt serialisation
refactor(base): extract query-param builder helper
```

- Keep the summary under 72 characters.
- Use the imperative mood: "add", not "added" or "adds".
- Reference issues when relevant: `fix(webhooks): handle 429 rate limit (#42)`.

---

## Coding standards

### Language

All code, comments, JSDoc, and documentation **must be written in English**.

### TypeScript

- `strict: true` is enforced — no `any`, no non-null assertion abuse.
- Use `type` imports (`import type { ... }`) for interfaces and types that are not used as values.
- Prefer `const` over `let`; never use `var`.

### Angular patterns

- Use `inject()` for dependency injection — **not** constructor injection.
- All services must be decorated with `@Injectable()` (no arguments needed; they are explicitly provided).
- New services must extend `BaseService` to inherit `http`, `config`, `authHeaders()`, and `voidRequest()`.
- For endpoints that return HTTP 204 (no body), use `voidRequest()` — never `delete<void>()` or similar, which throws on empty bodies.

### RxJS

- Return `Observable<T>` from all public methods — never subscribe internally.
- Prefer `pipe(map(...))` over nested `.pipe()` chains.
- Do not add `shareReplay`, `retry`, or other operators inside the SDK; leave those decisions to the consumer.

### JSDoc

Every public method **must** have a JSDoc block with:

- A one-line description ending with the HTTP method and route in backtick-parentheses, e.g. `` (`POST /v1/emails`) ``.
- `@param` for every non-obvious parameter.
- `@returns` describing the Observable payload when it is not self-evident.

Example:

```ts
/**
 * Send a transactional email (`POST /v1/emails`).
 * At least one of `html`, `text`, or `templateId` is required.
 *
 * @param params Email parameters.
 * @param idempotencyKey Optional key that guarantees exactly-once delivery.
 * @returns Observable emitting the created email `id`.
 */
send(params: SendEmailParams, idempotencyKey?: string): Observable<{ id: string }> { ... }
```

### Types

- All request parameter interfaces go in `src/tratto.types.ts` and must be exported from `src/index.ts`.
- Name request param interfaces `<Action><Resource>Params` (e.g. `CreateContactParams`).
- Name response interfaces after the resource noun (e.g. `Contact`, `EmailDetail`, `CampaignStatsDetail`).
- Never use `any` or `unknown` as a return type visible in the public API.

### Comments

Do **not** add inline comments that explain *what* the code does — well-named identifiers already do that. Only add a comment when the *why* is non-obvious (a constraint, a workaround, a subtle invariant).

---

## Adding a new resource service

Following these steps keeps every service consistent.

1. **Create `src/services/<resource>.service.ts`**

   ```ts
   import { Injectable } from '@angular/core';
   import { Observable } from 'rxjs';
   import { map } from 'rxjs/operators';
   import { BaseService } from './base.service';
   import type { MyResource, CreateMyResourceParams } from '../tratto.types';

   /** Service for managing <resource>. */
   @Injectable()
   export class MyResourceService extends BaseService {
     private get url(): string {
       return `${this.apiBaseUrl}/v1/<resource>`;
     }

     /** Create a <resource> (`POST /v1/<resource>`). */
     create(params: CreateMyResourceParams): Observable<{ id: string }> {
       return this.http
         .post<{ data: { id: string } }>(this.url, params, { headers: this.authHeaders() })
         .pipe(map((r) => r.data));
     }
   }
   ```

2. **Add types** to `src/tratto.types.ts`.

3. **Register the service** in `src/tratto.module.ts`:

   ```ts
   import { MyResourceService } from './services/my-resource.service';

   const TRATTO_PROVIDERS = [
     // ... existing services
     MyResourceService,
   ];
   ```

4. **Expose it on `TrattoService`** in `src/tratto.service.ts`:

   ```ts
   readonly myResource = inject(MyResourceService);
   ```

5. **Export everything** from `src/index.ts`:

   ```ts
   export { MyResourceService } from './services/my-resource.service';
   export type { MyResource, CreateMyResourceParams } from './tratto.types';
   ```

6. **Add a spec** `src/services/<resource>.service.spec.ts` covering every public method.

7. **Document** the new service in `README.md` following the same pattern as existing sections.

8. **Update `CHANGELOG.md`** under an `[Unreleased]` heading.

---

## Submitting a pull request

1. Fork the repo and create a branch following the naming convention above.
2. Make your changes, ensuring all coding standards are met.
3. Verify the library builds and tests pass:
   ```bash
   npm run build
   npm test
   ```
4. Open a PR against `main`. Fill in the PR template completely.
5. Keep PRs focused — one feature or fix per PR.
6. Be responsive to review comments; mark threads resolved once addressed.

### PR checklist

- [ ] Branch name follows the convention
- [ ] Commit messages follow Conventional Commits
- [ ] All public methods have JSDoc
- [ ] New types are exported from `src/index.ts`
- [ ] New services are registered in `tratto.module.ts` and `tratto.service.ts`
- [ ] Spec file added/updated and `npm test` passes
- [ ] `README.md` updated if the public API changed
- [ ] `CHANGELOG.md` updated under `[Unreleased]`
- [ ] `npm run build` passes locally

---

## Release process

> Maintainers only.

1. Move the `[Unreleased]` CHANGELOG section to a versioned heading, e.g. `[0.2.0] — YYYY-MM-DD`.
2. Bump the version in `package.json` following [semver](https://semver.org/):
   - **patch** — bug fixes only
   - **minor** — new public API, backwards-compatible
   - **major** — breaking changes
3. Commit: `chore: release v0.2.0`
4. Tag: `git tag v0.2.0`
5. Build and publish:
   ```bash
   npm run build
   cd dist
   npm publish --access public
   ```
6. Push the tag: `git push origin v0.2.0`
