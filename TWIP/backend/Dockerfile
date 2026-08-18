FROM python:3.12-slim

WORKDIR /workspace

# Install system dependencies (needed for compilation of some packages)
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port 8000
EXPOSE 8000

# Command to run backend
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
