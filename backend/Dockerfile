FROM python:3.11-slim

WORKDIR /workspace

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    libpq-dev \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender1 \
    libgl1 \
    && rm -rf /var/lib/apt/lists/*

ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

ENV UPLOAD_DIR=/workspace/uploads

COPY requirements.txt .

RUN pip install --upgrade pip

RUN pip install --no-cache-dir --default-timeout=120 --retries 5 -r requirements.txt

COPY . .

RUN mkdir -p \
    uploads \
    reports \
    datasets \
    models

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]