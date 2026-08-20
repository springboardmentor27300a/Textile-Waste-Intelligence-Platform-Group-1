# ─────────────────────────────────────────────────────────────────────────────
# Backend Dockerfile — Textile Waste Intelligence Platform (Milestone 4)
# ─────────────────────────────────────────────────────────────────────────────
FROM python:3.11-slim

# System dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Non-root user for security
RUN groupadd -r twip && useradd -r -g twip -d /app -s /sbin/nologin twip

WORKDIR /app

# Install Python dependencies first (layer caching)
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create required directories and set permissions
RUN mkdir -p uploads logs && \
    chown -R twip:twip /app

# Switch to non-root user
USER twip

# Expose port
EXPOSE 8000

# Health check — Docker will restart container if health fails
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')"

# Start command
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
