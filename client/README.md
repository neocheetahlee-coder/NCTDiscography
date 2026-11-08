# NCT Discography frontend

## Local development

From the repository root, run `npm run dev`. Express runs on port 3000 and
Vite runs on port 5173. Vite proxies `/api` requests to Express.

## Deploy as two Vercel projects

Deploy both projects from the same Git repository:

1. **Backend project**
   - Set **Root Directory** to the repository root.
   - Keep the root `package.json` and `server.js` in place.
   - Vercel detects the exported Express app in `server.js` using its
     zero-configuration Node.js support.
   - Deploy and note the backend deployment URL.

2. **Frontend project**
   - Create a second Vercel project for the same repository.
   - Set **Root Directory** to `client`.
   - Use `npm run build` as the build command and `dist` as the output
     directory.
   - In `client/vercel.json`, replace
     `https://YOUR-BACKEND-PROJECT.vercel.app` with the backend deployment
     URL, then redeploy the frontend.

The frontend rewrite forwards `/api/*` requests to the backend. Member photos
are served from `client/public/images/members/` by the frontend deployment.
