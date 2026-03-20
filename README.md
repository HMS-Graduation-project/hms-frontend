# HMS Frontend

React single-page application for the HMS platform.

## Tech Stack

- **React 18** with TypeScript
- **Vite** for development and bundling
- **TailwindCSS v3** with CSS variables for theming
- **shadcn/ui** components (manually written, not CLI-installed)
- **React Router v6** for client-side routing
- **TanStack Query** for server state management
- **Zod + React Hook Form** for form validation

## Pages

| Route       | Description                  | Auth Required |
|-------------|------------------------------|---------------|
| `/login`    | Sign in with email/password  | No            |
| `/register` | Create a new account         | No            |
| `/profile`  | View current user profile    | Yes           |

All other routes redirect to `/login`.

## Local Development

```bash
npm install
npm run dev
```

The dev server starts on `http://localhost:5173`.

## Environment Variables

| Variable             | Default | Description                        |
|----------------------|---------|------------------------------------|
| `VITE_API_BASE_URL`  | `/api`  | Base URL for backend API requests  |

Copy `.env.example` to `.env` to customize:

```bash
cp .env.example .env
```

## API Proxy

In production, nginx proxies `/api` requests to the backend service. During local development, configure `VITE_API_BASE_URL` to point to your running backend or use the Docker Compose setup from `hms-infra`.

## Auth Token Storage

The JWT access token is stored in `localStorage` for simplicity. This approach is vulnerable to XSS attacks. For production environments requiring higher security, consider using httpOnly cookies with a backend-for-frontend (BFF) pattern.

## Docker

This service is typically run via `docker compose` from the `hms-infra` repository. To run standalone:

```bash
docker build -t hms-frontend .
docker run -p 5173:5173 hms-frontend
```

## Scripts

| Command           | Description                |
|-------------------|----------------------------|
| `npm run dev`     | Start Vite dev server      |
| `npm run build`   | Type-check and build       |
| `npm run preview` | Preview production build   |
| `npm run lint`    | Run ESLint                 |
