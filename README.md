# ReturnShield AI (frontend)

Next.js (App Router) + TypeScript + Tailwind CSS v4 + Recharts + Lucide.

STATUS: the source has not been installed, linted or built by its author.
Run the commands below and fix anything they report.

## Run locally or in a cloud IDE
Requires Node.js 18.18 or newer (20 recommended, see .nvmrc).

    npm install
    npm run lint
    npm run build
    npm run dev        # http://localhost:3000

Use `npm start` after a successful build for the production server.

## Cloud development environments (tablet-friendly)
1. Upload the project (or push it to a GitHub repository).
2. Open it in a cloud IDE such as GitHub Codespaces, Replit or CodeSandbox
   (choose a Node/Next.js container, not a static-site template).
3. In the terminal run `npm install`, then `npm run dev`.
4. Open the forwarded port 3000 in the preview pane or a new browser tab.
   In Codespaces, set the port visibility as needed in the Ports tab.

The `next/font/google` font downloads on first run, so the environment needs
internet access.

## Routes
/, /features, /how-it-works, /pricing, /login, /register

## What is real, what is not
- Dashboard figures come from `lib/mock-data.ts` and are fictional
  ("Sample data — not real customers").
- Login/register validate input but do not authenticate. `lib/auth-client.ts`
  is the backend integration point. It calls
  `${NEXT_PUBLIC_API_URL}/api/v1/auth/{login|register}` only when that variable
  is set (see `.env.example`).
- Pricing shows `[YOUR PRICE]` placeholders and is labelled as proposed.
- No marketplace integrations are active.

## Not built yet
/dashboard/* routes, contact/privacy/terms pages, backend, ML and LLM engines.

## Troubleshooting
- Peer dependency errors: `npm install --legacy-peer-deps`
- Missing lucide icon: replace the named icon with one from the lucide-react list
- Styles missing: check `postcss.config.mjs` exists and `app/globals.css`
  starts with `@import "tailwindcss";`
                                                                                                           
