FROM python:3.12-slim

WORKDIR /app

# System dependencies required by OpenCV and other Python packages
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Copy dependency file first for better Docker layer caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend application
COPY app ./app

# Copy sample images if required by the application
COPY sample_images ./sample_images

# Create uploads directory
RUN mkdir -p /app/uploads

# Backend port
EXPOSE 8000

# Start FastAPI
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]