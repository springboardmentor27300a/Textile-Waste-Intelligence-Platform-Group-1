# Reloom — Deployment Guide

## Being direct about scope

I built and tested the Docker configuration below (Dockerfiles, compose
file, structure) and verified it against the project's actual dependencies.
I have **not** deployed this to a live AWS or Azure account — that needs
your own cloud account, billing details, and credentials, which no AI
assistant can supply or access on your behalf. What follows is a real,
concrete, step-by-step guide for doing it yourself, not a claim that it's
already running somewhere.

## Part 1 — Docker (local or any server)

The project already has:
- `backend/Dockerfile` — Python 3.12-slim, installs OpenCV's system
  dependencies (`libgl1`, `libglib2.0-0`) which `opencv-python-headless`
  needs, then the Python requirements.
- `frontend/Dockerfile` — multi-stage build: Node builds the Vite app,
  then a slim `serve` image hosts the static output.
- `docker-compose.yml` — wires up PostgreSQL, the backend, and the
  frontend together with the right environment variables.

Run the whole stack:

```bash
docker compose up --build
docker compose exec backend python -m app.seed_data   # first time only
```

Backend on `:8000`, frontend on `:5173`, PostgreSQL on `:5432`.

If you don't have Docker installed locally, verify the images at least
build correctly before you deploy anywhere:

```bash
docker build -t reloom-backend ./backend
docker build -t reloom-frontend ./frontend
```

## Part 2 — AWS deployment

The simplest realistic path for this project is **EC2 + Docker Compose**
(same containers as local, just running on a rented server) rather than a
more complex managed-container setup, since it reuses everything already
built without redesigning it.

1. **Launch an EC2 instance.** Ubuntu 22.04, at least `t3.small` (the
   OpenCV/scikit-learn dependencies want more than the free-tier
   `t2.micro`'s 1GB RAM). Open inbound ports 22 (SSH), 80/443 (if you put
   a reverse proxy in front), and optionally 8000/5173 directly for testing.

2. **Install Docker on the instance:**
   ```bash
   sudo apt update && sudo apt install -y docker.io docker-compose-plugin
   sudo usermod -aG docker $USER
   ```
   Log out and back in for the group change to apply.

3. **Get the code onto the instance** — either `git clone` your repo, or
   `scp` the project folder up.

4. **Set real production values** in `backend/.env`:
   ```
   DATABASE_URL=postgresql+psycopg2://reloom_user:<a-strong-password>@db:5432/reloom_db
   SECRET_KEY=<a-long-random-string, e.g. from `openssl rand -hex 32`>
   CORS_ORIGINS=http://<your-ec2-public-ip>:5173
   ```

5. **Run it:**
   ```bash
   docker compose up --build -d
   docker compose exec backend python -m app.seed_data
   ```

6. **Optional but recommended for a real deployment**: put an Nginx
   reverse proxy (or AWS's Application Load Balancer) in front, with a
   real domain and TLS certificate (Let's Encrypt via `certbot`), so you're
   not exposing raw ports 8000/5173 to the internet.

**Alternative**: AWS Elastic Beanstalk's "Docker running on 64bit Amazon
Linux" platform can take the same `docker-compose.yml` with minimal
changes, and handles load balancing/scaling for you — worth it if this
needs to handle real traffic rather than a demo/grading deployment.

## Part 3 — Azure deployment

**Azure App Service for Containers** is the closest equivalent to
Elastic Beanstalk and needs the least new configuration:

1. **Create an Azure Container Registry (ACR)** and push both images:
   ```bash
   az acr create --resource-group reloom-rg --name reloomregistry --sku Basic
   az acr login --name reloomregistry
   docker tag reloom-backend reloomregistry.azurecr.io/reloom-backend:latest
   docker push reloomregistry.azurecr.io/reloom-backend:latest
   docker tag reloom-frontend reloomregistry.azurecr.io/reloom-frontend:latest
   docker push reloomregistry.azurecr.io/reloom-frontend:latest
   ```

2. **Create an Azure Database for PostgreSQL** (Flexible Server) instead
   of running Postgres in a container — this is the managed-database
   equivalent of what `docker-compose.yml`'s `db` service does locally:
   ```bash
   az postgres flexible-server create --resource-group reloom-rg \
     --name reloom-db-server --admin-user reloom_user --admin-password <strong-password>
   ```

3. **Create two App Service instances** (one per container), pointing at
   the images in ACR:
   ```bash
   az appservice plan create --name reloom-plan --resource-group reloom-rg --is-linux --sku B1
   az webapp create --resource-group reloom-rg --plan reloom-plan --name reloom-backend \
     --deployment-container-image-name reloomregistry.azurecr.io/reloom-backend:latest
   az webapp create --resource-group reloom-rg --plan reloom-plan --name reloom-frontend \
     --deployment-container-image-name reloomregistry.azurecr.io/reloom-frontend:latest
   ```

4. **Set the backend's environment variables** (`DATABASE_URL` pointing at
   the Flexible Server from step 2, `SECRET_KEY`, `CORS_ORIGINS` pointing at
   the frontend's App Service URL) through the Azure Portal or:
   ```bash
   az webapp config appsettings set --resource-group reloom-rg --name reloom-backend \
     --settings DATABASE_URL="postgresql+psycopg2://reloom_user:<password>@reloom-db-server.postgres.database.azure.com:5432/reloom_db" SECRET_KEY="<random-string>"
   ```

5. Run the seed script once, either via `az webapp ssh` into the backend
   container, or by adding it as a one-off startup command.

## Part 4 — What to actually do for a class submission

If this is for grading rather than genuine production traffic, the
realistic, defensible thing to submit is:
- The Docker setup, demonstrated running locally (`docker compose up`)
- This guide, showing you understand what real cloud deployment involves
- If you do have free AWS/Azure student credits, the EC2 path (Part 2) is
  the fastest to actually get live and demo — it's a 20–30 minute setup,
  not a multi-day project.
