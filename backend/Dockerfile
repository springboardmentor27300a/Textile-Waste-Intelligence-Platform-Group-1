FROM python:3.10-slim

WORKDIR /workspace

# Install system dependencies (build-essential, postgresql-client, etc.)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy and install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend application source
COPY . .

EXPOSE 8000

ENV PYTHONUNBUFFERED=1
ENV UPLOAD_DIR=/workspace/uploads

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
