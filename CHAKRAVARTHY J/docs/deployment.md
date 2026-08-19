# Deployment Guide — Milestone 4

This platform ships as a single Docker image (Flask + gunicorn serving
both the API and the server-rendered frontend) with a persisted SQLite
volume. It can run locally with Docker Compose or on any container
host that accepts a Dockerfile (Render, Railway, Fly.io, AWS App
Runner/ECS, Azure Container Apps, Google Cloud Run, etc.).

## 1. Local deployment with Docker Compose

**Prerequisites:** Docker Desktop (or Docker Engine + Compose plugin) installed.

```bash
git clone <your-repo-url>
cd textile-waste-platform

# optional: copy and edit environment overrides
cp .env.example .env   # if you created one; otherwise export vars inline

docker compose up --build
```

The platform is now available at **http://localhost:5000**. The default
seeded accounts (see `backend/app/__init__.py`) still apply for first login.

Stop it with `docker compose down`. Data persists in the
`textile-waste-data` named volume between runs; remove it with
`docker compose down -v` to reset to a clean database.

## 2. Configuration

All configuration is via environment variables (see `docker-compose.yml`):

| Variable | Purpose | Default |
|---|---|---|
| `SECRET_KEY` | Flask session/signing secret | dev value — **override in production** |
| `JWT_SECRET_KEY` | JWT signing secret | dev value — **override in production** |
| `DATABASE_URL` | SQLAlchemy database URI | local SQLite file under the persisted volume |

For a managed Postgres database instead of SQLite, set `DATABASE_URL` to
a `postgresql+psycopg2://...` URI and add `psycopg2-binary` to
`backend/requirements.txt`.

## 3. Building and running the image directly

```bash
docker build -t textile-waste-platform:milestone4 .
docker run -p 5000:5000 \
  -e SECRET_KEY=change-me \
  -e JWT_SECRET_KEY=change-me-too \
  -v textile-waste-data:/app/backend/instance \
  textile-waste-platform:milestone4
```

## 4. Deploying to a cloud container service

The image is a standard Dockerfile with no platform-specific hooks, so
any of these work with minimal extra setup:

- **Render / Railway** — point a Web Service at the repo, they detect
  the `Dockerfile` automatically. Set `SECRET_KEY`/`JWT_SECRET_KEY` as
  environment variables in the dashboard, and attach a persistent disk
  mounted at `/app/backend/instance` if you want the SQLite data to
  survive redeploys (otherwise switch to a managed Postgres add-on).
- **Fly.io** — `fly launch` will detect the Dockerfile; `fly volumes create`
  + mount at `/app/backend/instance` for persistence.
- **Google Cloud Run / AWS App Runner** — push the image to the
  provider's registry, deploy on port `5000`. Prefer a managed
  Postgres instance over SQLite for these, since container filesystems
  are typically ephemeral.

## 5. Health checks

`GET /api/health` returns `{"status": "ok", ...}` with HTTP 200 and is
used by the Dockerfile's own `HEALTHCHECK` as well as the
`healthcheck:` block in `docker-compose.yml`. Point your load
balancer's / cloud provider's health check at this same path.

## 6. Scaling notes

- The gunicorn `CMD` in the `Dockerfile` runs 2 workers; bump
  `--workers` (rule of thumb: `2 x CPU cores + 1`) for more traffic.
- SQLite is fine for a portfolio/demo deployment but is single-writer;
  move to Postgres (via `DATABASE_URL`) before putting this behind
  real concurrent write traffic.
- Put nginx or the cloud provider's managed load balancer in front for
  TLS termination — gunicorn itself is not meant to face the public
  internet directly in a high-traffic production setup.
