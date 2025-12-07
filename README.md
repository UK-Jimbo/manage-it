# Project Manager - Self-Hosted Auth Foundation

This project demonstrates a production-quality, self-hosted authentication foundation using **Next.js App Router**, **SuperTokens Core**, and **PostgreSQL**.

## Features

- **Self-Hosted**: SuperTokens Core and Postgres run via Docker Compose.
- **Headless UI**: Custom login page built with Tailwind CSS + shadcn/ui.
- **Auth Abstraction**: All auth logic isolated in `lib/auth` for future portability.
- **Protected Routes**: Middleware and server-side session verification.
- **App Router**: Fully compatible with Next.js 15+ App Router.

## Prerequisites

- Docker & Docker Compose
- Node.js 18+

## Setup

1.  **Environment Variables**:
    Copy the example env file to `.env.local`:

    ```bash
    cp env.local.example .env.local
    ```

    _Note: The example file is named `env.local.example` to avoid gitignore issues. Rename it to `.env.local`._

2.  **Start Infrastructure**:
    Run Docker Compose to start Postgres and SuperTokens:

    ```bash
    docker compose up -d
    ```

    _Wait for containers to be healthy._

3.  **Initialize Database**:
    The `docker/init-schemas.sql` script is automatically mounted to the Postgres container and runs on first startup. It creates the `supertokens` and `app` schemas.

    If you need to manually verify or reset:

    ```bash
    docker compose exec db psql -U pm_user -d project_manager -f /docker-entrypoint-initdb.d/init-schemas.sql
    ```

4.  **Install Dependencies**:

    ```bash
    pnpm install
    ```

5.  **Run Application**:
    ```bash
    pnpm dev
    ```
    Visit [http://localhost:3000](http://localhost:3000).

## Testing & Acceptance Criteria

Follow these steps to verify the implementation:

1.  **Public Access**:

    - Visit `http://localhost:3000/`. You should see the Home page.
    - Visit `http://localhost:3000/about`. You should see the About page.

2.  **Protected Route Redirect**:

    - Visit `http://localhost:3000/dashboard`.
    - You should be redirected to `/login`.

3.  **Registration / Login**:

    - On the Login page, switch to "Sign Up" (if not default) or just enter a new email/password (SuperTokens default flow might handle both or require explicit sign up call - our custom UI has a toggle).
    - Enter `test@example.com` / `password123`.
    - Click "Sign Up".
    - You should be redirected to `/dashboard`.

4.  **Session Verification**:

    - On the Dashboard, you should see "Welcome, test@example.com".
    - Refresh the page. You should stay logged in.
    - Visit `/account`. You should see your User ID and metadata.

5.  **Database Verification**:

    - Check that the user exists in Postgres:

    ```bash
    docker compose exec db psql -U pm_user -d project_manager -c "SELECT * FROM supertokens.emailpassword_users;"
    ```

6.  **Logout**:
    - Click "Sign Out" on the dashboard.
    - You should be redirected to `/login`.
    - Try visiting `/dashboard` again. You should be redirected to `/login`.

## Architecture & Portability

The authentication implementation is isolated in `lib/auth`.

- **`lib/auth/index.ts`**: Main abstraction for server-side auth (getSession, getUser).
- **`lib/auth/client.ts`**: Client-side helpers (signIn, signUp, signOut).
- **`lib/auth/init.ts`**: Backend configuration.
- **`middleware.ts`**: Route protection logic.

### Swapping the Provider

To replace SuperTokens with another provider (e.g., Auth.js, Clerk):

1.  **Keep**: `app/(protected)/*`, `app/page.tsx`, `app/about/page.tsx`, `lib/db/*`.
2.  **Replace**:
    - Re-implement functions in `lib/auth/index.ts` to use the new provider's SDK.
    - Update `lib/auth/client.ts` to use the new provider's client SDK.
    - Update `middleware.ts` to use the new provider's session check.
    - Remove `app/api/auth/[...supertokens]` and add the new provider's API route if needed.
    - Update `docker-compose.yml` to remove SuperTokens service.

## Commit History (Suggested)

- `feat: initial project structure and docker-compose`
- `feat: add supertokens backend configuration and auth abstraction`
- `feat: add middleware for protected routes`
- `feat: add custom login page and client auth helpers`
- `feat: add protected dashboard and account pages`
- `docs: add README with setup and test instructions`
