# Bipul Arcade

A dark-neon, responsive Next.js browser arcade with 10 mini-game pages and browser-local personal bests.

## Run locally
- Install Node.js 20+
- Run `npm install`
- Run `npm run dev`
- Open http://localhost:3000

## Deploy to Vercel
1. Create a GitHub repository named `bipul-arcade`.
2. Upload the contents of this folder to the repository root.
3. In Vercel choose **Add New → Project**, then import the GitHub repository.
4. Keep the framework preset as Next.js. No environment variables are required.
5. Click **Deploy**. Your live site will receive a `*.vercel.app` URL.
6. Push future updates to GitHub; Vercel will redeploy automatically.

## Games
99% Fail, Perfect Stack, Memory Match, Snake Challenge, Tic Tac Toe, Reaction Tap, Whack-a-Mole, Number Rush, Bubble Pop, Color Switch Rush.

## Important notes
This is a starter project with working lightweight game interactions. Scores are saved in localStorage on the visitor's device, not in a shared global leaderboard. Test and refine game balance, accessibility and mobile behavior before a public launch. The runner/stack/snake/color experiences are simple arcade tap challenges rather than full physics simulations.
