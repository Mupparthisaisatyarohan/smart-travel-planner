# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Vercel deployment

This app can be deployed as a static site on Vercel from the `frontend/travel-story-app` folder.

1. Build command: `npm run build`
2. Output directory: `dist`
3. Set environment variable: `VITE_API_BASE_URL` to your backend URL (for example `https://api.example.com`).

> The backend server must be hosted separately; Vercel will only serve the React frontend.

If you deploy the backend elsewhere, make sure the backend exposes the same endpoints as the app expects, and that `VITE_API_BASE_URL` points to that deployed backend.
