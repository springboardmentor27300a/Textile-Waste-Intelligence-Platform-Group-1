# Textile Waste Intelligence Platform - Milestone 4 deployment image
# Multi-stage build: install deps in a builder layer, copy a lean
# runtime image so the final image doesn't carry pip's build cache.

FROM python:3.12-slim AS builder

WORKDIR /build
COPY backend/requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

FROM python:3.12-slim

RUN useradd --create-home --uid 1000 appuser
WORKDIR /app

COPY --from=builder /root/.local /home/appuser/.local
ENV PATH=/home/appuser/.local/bin:$PATH \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

COPY backend/ backend/
COPY frontend/ frontend/

RUN mkdir -p backend/instance && chown -R appuser:appuser /app

USER appuser
WORKDIR /app/backend

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:5000/api/health')" || exit 1

# 2 workers is plenty for the demo/portfolio scale this platform targets;
# raise --workers and add a reverse proxy (nginx) in front for real load.
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "2", "--timeout", "120", "run:app"]
