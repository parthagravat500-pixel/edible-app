# Edible — real camera + AI prototype

This is the deployable version of Edible.

## What actually works
- iPhone camera capture
- Upload Photo
- Photo preview
- Sends photo to server
- AI identifies packaged food or cooked/raw food
- AI estimates nutrition
- Deterministic scoring engine calculates the final 0–10 score
- Result page
- Food categories
- Compare
- History using localStorage
- Explore
- Profile

## Important
Do not put an OpenAI API key in browser JavaScript. This project uses a server API route so the key stays server-side.

## Run locally
1. Install Node.js 20+
2. `npm install`
3. Copy `.env.example` to `.env.local`
4. Put your OpenAI API key in `.env.local`
5. `npm run dev`
6. Open http://localhost:3000

## Deploy
Deploy the folder to a Next.js host such as Vercel and add `OPENAI_API_KEY` as a server environment variable.

Once deployed, opening the HTTPS URL on an iPhone allows the camera/upload flow to run as a real web app.
