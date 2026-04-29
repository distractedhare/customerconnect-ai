# T-Sales Assistant PWA

Offline-first coaching for T-Mobile virtual retail reps.

## Local run

1. Install dependencies:
   `npm install`
2. Start the app:
   `npm run dev`

The app always ships with instant local coaching from the embedded data layer plus the current `weekly-update.json`.

## Optional AI assist

AI enrichment is optional and never blocks the rep flow. The PWA builds a local plan first, then tries to sharpen it in the background when AI is configured.

Recommended for deployment:

- `AI_COMPLETIONS_URL`
- `AI_MODEL`
- `AI_API_KEY`

Those power the Vercel `/api/ai` proxy so keys stay off the client.

Direct browser fallback is also supported for local/internal testing only:

- `VITE_AI_COMPLETIONS_URL`
- `VITE_AI_MODEL`
- `VITE_AI_API_KEY`

### Verify Gemma before launch

Health check only:

`npm run check:ai -- --url=https://meridianvrtesting.com --health-only`

Full smoke test:

`npm run check:ai -- --url=https://meridianvrtesting.com`

The smoke test fails fast if the Vercel proxy is missing config, the auth is wrong, or the model returns an empty response.

## Monday-safe behavior

- No AI config: the app still works with local coaching only.
- AI timeout or provider failure: the local plan stays visible.
- First load: the app now waits for the weekly data before generating the plan so promos and intel populate consistently.
