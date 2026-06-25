# Tratto Angular SDK — Example App

A minimal Angular 22 standalone app demonstrating the `@tratto/angular` SDK.

## Features demonstrated

- SDK setup via `provideTratt()` in `app.config.ts`
- Send a transactional email from a simple form
- List contacts with cursor-based pagination
- Display an analytics summary for the last 30 days

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Set your API key

Open `src/environments/environment.ts` and replace the placeholder:

```ts
export const environment = {
  trattoApiKey: 'tratto_live_YOUR_API_KEY_HERE',
};
```

You can create an API key in the [Tratto dashboard](https://app.tratto.email).

### 3. Start the dev server

```bash
npm start
```

Then open `http://localhost:4200`.

## Key files

| File | Purpose |
|---|---|
| `src/app.config.ts` | Wires up `provideHttpClient()` and `provideTratt()` |
| `src/app.component.ts` | Standalone component: send email, list contacts, analytics |
| `src/environments/environment.ts` | API key placeholder |
